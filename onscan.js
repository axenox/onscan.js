/*
 * onScan.js - scan-events for hardware barcodes scanners in javascript
 */
var onScan = {		
	attachTo: function(oDomElement, oOptions) {

		if(oDomElement.scannerDetectionData != undefined){
			throw new Error("onScan.js is already initialized for DOM element " + oDomElement);
		}

		var oDefaults = {
			onScan: function(sScanned, iQty){}, // Callback after detection of a successfull scanning:  function(){sScancode, iCount)}()
			onScanError: function(oDebug){}, // Callback after detection of a unsuccessfull scanning (scanned string in parameter)
			onKeyProcess: function(sChar, oEvent){}, // Callback after receiving and processing a char (scanned char in parameter)
			onKeyDetect: function(iKeyCode, oEvent){}, // Callback after detecting a keyDown (key char in parameter) - in contrast to onKeyProcess, this fires for non-character keys like tab, arrows, etc. too!
			onPaste: function(sPasted, oEvent){}, // Callback after receiving a value on paste, no matter if it is a valid code or not
			keyCodeMapper: function(oEvent){return String.fromCharCode(oEvent.which)}, // Custom function to decode a keydown event into a character. Must return decoded character or NULL if the given event should not be processed.
			onScanButtonLongPress: function(){}, // Callback after detection of a successfull scan while the scan button was pressed and held down
			scanButtonKeyCode:false, // Key code of the scanner hardware button (if the scanner button a acts as a key itself) 
			scanButtonLongPressTime:500, // How long (ms) the hardware button should be pressed, until a callback gets executed
			timeBeforeScanTest:100, // Wait duration (ms) after keypress event to check if scanning is finished
			avgTimeByChar:30, // Average time (ms) between 2 chars. Used to do difference between keyboard typing and scanning
			minLength:6, // Minimum length for a scanning
			suffixKeyCodes:[9,13], // Chars to remove and means end of scanning
			prefixKeyCodes:[], // Chars to remove and means start of scanning
			ignoreIfFocusOn:false, // do not handle scans if the currently focused element matches this selector or object
			stopPropagation:false, // Stop immediate propagation on keypress event
			preventDefault:false, // Prevent default action on keypress event
			reactToKeydown:true, // look for scan input in keyboard events
			reactToPaste:false, // look for scan input in paste events
			singleScanQty: 1 // Quantity of Items put out to onScan in a single scan
		}
								
		oOptions = this._mergeOptions(oDefaults, oOptions);

		// initializing options and variables on DomElement
		oDomElement.scannerDetectionData = {
				options: oOptions,
				vars:{
					firstCharTime: 0,
					lastCharTime: 0,
					stringWriting: '',
					callIsScanner: false,
					testTimer: false,
					longPressTimeStart: 0,
					longPressed: false
				}
			
		};
		
		// initializing handlers (based on settings)
		if (oOptions.reactToPaste === true){
			oDomElement.addEventListener("paste", this._handlePaste);
		}
		if (oOptions.scanButtonKeyCode !== false){
			oDomElement.addEventListener("keyup", this._handleKeyUp);
		}
		if (oOptions.reactToKeydown === true || oOptions.scanButtonKeyCode !== false){	
			oDomElement.addEventListener("keydown", this._handleKeyDown);
		}
	},
	
	detachFrom: function(oDomElement) {
		// detaching all used events
		if (oDomElement.scannerDetectionData.options.reactToPaste){
			oDomElement.removeEventListener("paste", this._handlePaste);
		}
		if (oDomElement.scannerDetectionData.options.scanButtonKeyCode !== false){
			oDomElement.removeEventListener("keyup", this._handleKeyUp);
		}
		oDomElement.removeEventListener("keydown", this._handleKeyDown);
		
		// clearing data off DomElement
		oDomElement.scannerDetectionData = undefined; 
		
	},
	
	getOptions: function(oDomElement){
		return oDomElement.scannerDetectionData.options;			
	},
	
	setOptions: function(oDomElement, oOptions){
		// check if some handlers need to be changed based on possible option changes
		switch (oDomElement.scannerDetectionData.options.reactToPaste){
			case true: 
				if (oOptions.reactToPaste === false){
					oDomElement.removeEventListener("paste", this._handlePaste);
				}
				break;
			case false:
				if (oOptions.reactToPaste === true){
					oDomElement.addEventListener("paste", this._handlePaste);
				}
				break;
		}
		
		switch (oDomElement.scannerDetectionData.options.scanButtonKeyCode){
			case false:
				if (oOptions.scanButtonKeyCode !== false){
					oDomElement.addEventListener("keyup", this._handleKeyUp);
				}
				break;
			default: 
				if (oOptions.scanButtonKeyCode === false){
					oDomElement.removeEventListener("keyup", this._handleKeyUp);
				}
				break;
		}
		
		// merge old and new options
		oDomElement.scannerDetectionData.options = this._mergeOptions(oDomElement.scannerDetectionData.options, oOptions);
	
		// reinitiallize
		this._reinitialize(oDomElement);
	},
	
		
	simulate: function(oDomElement, sTestString){
		var oVars = oDomElement['scannerDetectionData'].vars;
		oVars.firstCharTime = 0;
		oVars.lastCharTime = 0;
		oVars.stringWriting = sTestString;
		this._validateScanCode(oDomElement);
		return this;
	},
	
	_reinitialize: function(oDomElement){
		var oVars = oDomElement['scannerDetectionData'].vars;
		oVars.firstCharTime = 0;
		oVars.stringWriting = '';

	},
	
	_isFocusOnIgnoredElement: function(oDomElement){
		
		ignoreSelectors = oDomElement['scannerDetectionData'].options.ignoreIfFocusOn;

        if(!ignoreSelectors){
			return false;
		}
	
		var oFocused = document.activeElement;
		
		// checks if ignored element is an array, and if so it checks if one of the elements of it is an active one
		if (Array.isArray(ignoreSelectors)){
			for(var i=0; i<ignoreSelectors.length; i++){
				if(oFocused.matches(ignoreSelectors[i]) === true){
					return true;
				}
			}
		// if the option consists of an single element, it only checks this one
		} else if (oFocused.matches(ignoreSelectors)){
			return true;					
		}
		
		// if the active element is not listed in the ignoreIfFocusOn option, return false
	    return false;
    },
	
	_validateScanCode: function(oDomElement){
		var oScannerData = oDomElement['scannerDetectionData'];			
		var oOptions = oScannerData.options;
		var iSingleScanQty = oScannerData.options.singleScanQty
		var sScanCode = oScannerData.vars.stringWriting;
		var iFirstCharTime = oScannerData.vars.firstCharTime;
		var iLastCharTime = oScannerData.vars.lastCharTime;
	
		switch(true){
			
			// detect codes that are too short
			case (sScanCode.length<oOptions.minLength):
				var oScanError = {
					message: "Receieved code is shorter then minimal length"
				};
				break;
				
			// detect codes that were entered too slow	
			case ((iLastCharTime - iFirstCharTime) > (sScanCode.length * oOptions.avgTimeByChar)):
				var oScanError = {
					message: "Receieved code was not entered in time"
				};				
				break;
				
			// if a code was not filtered out earlier it is valid	
			default:
				oOptions.onScan.call(oDomElement, sScanCode, iSingleScanQty);
				var oEvent = new CustomEvent(
					'scan',
					{	
						detail: { 
							scanCode: sScanCode,
							qty: iSingleScanQty
						}
					}
				);
				oDomElement.dispatchEvent(oEvent);
				onScan._reinitialize(oDomElement);
				return true;
		}
		
		// If an error occurred (otherwise the method would return earlier) create an object for errordetection
		oScanError.scanCode = sScanCode;
		oScanError.scanDuration = iLastCharTime - iFirstCharTime;
		oScanError.avgTimeByChar = oOptions.avgTimeByChar;
		oScanError.minLength = oOptions.minLength;
		
		oOptions.onScanError.call(oDomElement, oScanError);
		
		var oEvent = new CustomEvent(
			'scanError',
			oScanError
		);
		oDomElement.dispatchEvent(oEvent);
		
		onScan._reinitialize(oDomElement);
		return false;
		
    },

	_mergeOptions: function(oDefaults, oOptions){
		var oExtended = {};
		var prop;
		for (prop in oDefaults){
			if (Object.prototype.hasOwnProperty.call(oDefaults, prop)){
				oExtended[prop] = oDefaults[prop];
			}
		}			
		for (prop in oOptions){
			if (Object.prototype.hasOwnProperty.call(oOptions, prop)){
				oExtended[prop] = oOptions[prop];
			}
		}			
		return oExtended;
	},

	_getNormalizedKeyNum: function(e){
		var iKeyCode;  
		if(window.event) { // IE                    
		  iKeyCode = e.keyCode;
		} else if(e.which){ // Netscape/Firefox/Opera                   
		  iKeyCode = e.which;
		}
		return iKeyCode;
	},



	_handleKeyDown: function(e){
		// overwrite the which value of the event with keycode for cross platform compatibility
		e.which = onScan._getNormalizedKeyNum(e);
		var iKeyCode = e.which;
		var oOptions = this['scannerDetectionData'].options;
		var oVars = this['scannerDetectionData'].vars;
		
		oOptions.onKeyDetect.call(this, e.which, e);		
		
		if (onScan._isFocusOnIgnoredElement(this)){
			return;
		}
					
        // If it's just the button of the scanner, ignore it and wait for the real input
	    if(oOptions.scanButtonKeyCode !== false && iKeyCode==oOptions.scanButtonKeyCode) {
			
			// if the button was first pressed, start a timeout for the callback, which gets interrupted if the scanbutton gets released
			if (!oVars.longPressed){
				oVars.longPressTimer = setTimeout( oOptions.onScanButtonLongPress, oOptions.scanButtonLongPressTime, this);
				oVars.longPressed = true;
			}

			return;
        }
		
		if(oOptions.stopPropagation){
			e.stopImmediatePropagation();
		}
		
		if(oOptions.preventDefault){
			e.preventDefault();
		}
		
		switch(true){
			// If it's not the first character and we encounter a terminating character, trigger scan process
			case (oVars.firstCharTime && oOptions.suffixKeyCodes.indexOf(iKeyCode)!==-1):
				e.preventDefault();
				e.stopImmediatePropagation();
				this['scannerDetectionData'].vars.callIsScanner=true;
				break;
				
			// If it's the first character and we encountered one of the starting characters, don't process the scan	
			case (!oVars.firstCharTime && oOptions.prefixKeyCodes.indexOf(iKeyCode)!==-1):
				e.preventDefault();
				e.stopImmediatePropagation();
				oVars.callIsScanner=false;
				break;
				
			// Otherwise, just add the character to the scan string we're building	
			default:
				var character = oOptions.keyCodeMapper.call(this, e);
				if (character === null){
					return;
				}
				oVars.stringWriting += character;
				oVars.callIsScanner=false;
				break;
		}
        
		if(!oVars.firstCharTime){
			oVars.firstCharTime=Date.now();
		}
		
		oVars.lastCharTime=Date.now();

		if(oVars.testTimer){ 
			clearTimeout(oVars.testTimer);
		}
		
		if(oVars.callIsScanner){
			onScan._validateScanCode(this);
			oVars.testTimer=false;
		} else {
			oVars.testTimer=setTimeout(onScan._validateScanCode, oOptions.timeBeforeScanTest, this);
		}

		oOptions.onKeyProcess.call(this, character, e);
		
	},
	
	_handlePaste: function(e){

		// if the focus is on an ignored element, abort
		if (onScan._isFocusOnIgnoredElement(this)){
			return;
		}
		e.preventDefault();
					
		var sPasteString = (event.clipboardData || window.clipboardData).getData('text');
		this.scannerDetectionData.options.onPaste.call(this, sPasteString, event);
		
		var oVars = this.scannerDetectionData.vars;
		oVars.firstCharTime = 0;
		oVars.lastCharTime = 0;
		oVars.stringWriting = sPasteString;
		
		// validate the string
		onScan._validateScanCode(this);

	},
	
	_handleKeyUp: function(e){
		// if the focus is on an ignored element, abort
		if (onScan._isFocusOnIgnoredElement(this)){
			return;
		}
		
		var iKeyCode = onScan._getNormalizedKeyNum(e);
		
		// if hardware key is not being pressed anymore stop the timeout and reset
		if (iKeyCode == this.scannerDetectionData.options.scanButtonKeyCode){
			clearTimeout(this.scannerDetectionData.vars.longPressTimer);
			this.scannerDetectionData.vars.longPressed = false;
		}
		
		
		
	}
		
		
};