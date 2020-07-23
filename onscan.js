/*
 * onScan.js - scan-events for hardware barcodes scanners in javascript
 */
;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory()) :
    global.onScan = factory()
}(this, (function () {
	var onScan = {	
		
		/**
		 * 
		 * @param DomElement oDomElement
		 * @param Object oOptions
		 * @return self
		 */
		attachTo: function(oDomElement, oOptions) {
	
			if(oDomElement.scannerDetectionData !== undefined){
				throw new Error("onScan.js is already initialized for DOM element " + oDomElement);
			}
	
			var oDefaults = {
				onScan: function(sScanned, iQty){}, // Callback after detection of a successful scanning:  function(){sScancode, iCount)}()
				onScanError: function(oDebug){}, // Callback after detection of an unsuccessful scanning (scanned string in parameter)
				onKeyProcess: function(sChar, oEvent){}, // Callback after receiving and processing a char (scanned char in parameter)
				onKeyDetect: function(iKeyCode, oEvent){}, // Callback after detecting a keyDown (key char in parameter) - in contrast to onKeyProcess, this fires for non-character keys like tab, arrows, etc. too!
				onPaste: function(sPasted, oEvent){}, // Callback after receiving a value on paste, no matter if it is a valid code or not
				keyCodeMapper: function(oEvent) {return onScan.decodeKeyEvent(oEvent)}, // Custom function to decode a keydown event into a character. Must return decoded character or NULL if the given event should not be processed.
				onScanButtonLongPress: function(){}, // Callback after detection of a successful scan while the scan button was pressed and held down
				scanButtonKeyCode:false, // Key code of the scanner hardware button (if the scanner button acts as a key itself) 
				scanButtonLongPressTime:500, // How long (ms) the hardware button should be pressed, until a callback gets executed
				timeBeforeScanTest:100, // Wait duration (ms) after keypress event to check if scanning is finished
				avgTimeByChar:30, // Average time (ms) between 2 chars. Used to differentiate between keyboard typing and scanning
				minLength:6, // Minimum length for a scanning
				suffixKeyCodes:[9,13], // Chars to remove and means end of scanning
				prefixKeyCodes:[], // Chars to remove and means start of scanning
				ignoreIfFocusOn:false, // do not handle scans if the currently focused element matches this selector or object
				stopPropagation:false, // Stop immediate propagation on keypress event
				preventDefault:false, // Prevent default action on keypress event
				captureEvents:false, // Get the events before any listeners deeper in the DOM
				reactToKeydown:true, // look for scan input in keyboard events
				reactToPaste:false, // look for scan input in paste events
				singleScanQty: 1, // Quantity of Items put out to onScan in a single scan
			}
									
			oOptions = this._mergeOptions(oDefaults, oOptions);
	
			// initializing options and variables on DomElement
			oDomElement.scannerDetectionData = {
					options: oOptions,
					vars:{
						firstCharTime: 0,
						lastCharTime: 0,
						accumulatedString: '',
						testTimer: false,
						longPressTimeStart: 0,
						longPressed: false
					}
				
			};
			
			// initializing handlers (based on settings)
			if (oOptions.reactToPaste === true){
				oDomElement.addEventListener("paste", this._handlePaste, oOptions.captureEvents);
			}
			if (oOptions.scanButtonKeyCode !== false){
				oDomElement.addEventListener("keyup", this._handleKeyUp, oOptions.captureEvents);
			}
			if (oOptions.reactToKeydown === true || oOptions.scanButtonKeyCode !== false){	
				oDomElement.addEventListener("keydown", this._handleKeyDown, oOptions.captureEvents);
			}
			return this;
		},
		
		/**
		 * 
		 * @param DomElement oDomElement
		 * @return void
		 */
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
			return;
		},
		
		/**
		 * 
		 * @param DomElement oDomElement
		 * @return Object
		 */
		getOptions: function(oDomElement){
			return oDomElement.scannerDetectionData.options;			
		},
	
		/**
		 * 
		 * @param DomElement oDomElement
		 * @param Object oOptions
		 * @return self
		 */
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
			return this;
		},
		
		/**
		 * Transforms key codes into characters.
		 * 
		 * By default, only the follwing key codes are taken into account
		 * - 48-90 (letters and regular numbers)
		 * - 96-105 (numeric keypad numbers)
		 * - 106-111 (numeric keypad operations)
		 * 
		 * All other keys will yield empty strings!
		 * 
		 * The above keycodes will be decoded using the KeyboardEvent.key property on modern
		 * browsers. On older browsers the method will fall back to String.fromCharCode()
		 * putting the result to upper/lower case depending on KeyboardEvent.shiftKey if
		 * it is set.
		 * 
		 * @param KeyboardEvent oEvent
		 * @return string
		 */
		decodeKeyEvent : function (oEvent) {
			var iCode = this._getNormalizedKeyNum(oEvent);
			switch (true) {
				case iCode >= 48 && iCode <= 90: // numbers and letters
				case iCode >= 106 && iCode <= 111: // operations on numeric keypad (+, -, etc.)
					if (oEvent.key !== undefined && oEvent.key !== '') {
						return oEvent.key;
					}
				
					var sDecoded = String.fromCharCode(iCode);
					switch (oEvent.shiftKey) {
						case false: sDecoded = sDecoded.toLowerCase(); break;
						case true: sDecoded = sDecoded.toUpperCase(); break;
					}
					return sDecoded;
				case iCode >= 96 && iCode <= 105: // numbers on numeric keypad
					return 0+(iCode-96);
			}
			return '';
		},
		
		/**
		 * Simulates a scan of the provided code.
	     *
		 * The scan code can be defined as
		 * - a string - in this case no keyCode decoding is done and the code is merely validated
		 * against constraints like minLenght, etc.
		 * - an array of keyCodes (e.g. `[70,71,80]`) - will produce `keydown` events with corresponding
		 * `keyCode` properties. NOTE: these events will have empty `key` properties, so decoding may
		 * yield different results than with native events.
		 * - an array of objects (e.g. `[{keyCode: 70, key: "F", shiftKey: true}, {keyCode: 71, key: "g"}]`) -
		 * this way almost any event can be simulated, but it's a lot of work to do.
		 *
		 * @param DomElement oDomElement
		 * @param string|array mStringOrArray
		 * @return self
		 */
		simulate: function(oDomElement, mStringOrArray){
			this._reinitialize(oDomElement);
			if (Array.isArray(mStringOrArray)){
				mStringOrArray.forEach(function(mKey){
					var oEventProps = {};
					if( (typeof mKey === "object" || typeof mKey === 'function') && (mKey !== null) ) {
						oEventProps = mKey;
					} else {
						oEventProps.keyCode = parseInt(mKey);
					}
					var oEvent = new KeyboardEvent('keydown', oEventProps);
					document.dispatchEvent(oEvent);
				})
			} else {
				this._validateScanCode(oDomElement, mStringOrArray);
			}
			return this;
		},
		
		/**
		 * @private
		 * @param DomElement oDomElement
		 * @return void
		 */
		_reinitialize: function(oDomElement){
			var oVars = oDomElement.scannerDetectionData.vars;
			oVars.firstCharTime = 0;
			oVars.lastCharTime = 0;
			oVars.accumulatedString = '';
			return;
		},
		
		/**
		 * @private
		 * @param DomElement oDomElement
	     * @return boolean
		 */
		_isFocusOnIgnoredElement: function(oDomElement){
			
			var ignoreSelectors = oDomElement.scannerDetectionData.options.ignoreIfFocusOn;
	
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
		
	    /**
	     * Validates the scan code accumulated by the given DOM element and fires the respective events.
	     * 
	     * @private
	     * @param DomElement oDomElement
	     * @return boolean
	     */
		_validateScanCode: function(oDomElement, sScanCode){
			var oScannerData = oDomElement.scannerDetectionData;			
			var oOptions = oScannerData.options;
			var iSingleScanQty = oScannerData.options.singleScanQty;
			var iFirstCharTime = oScannerData.vars.firstCharTime;
			var iLastCharTime = oScannerData.vars.lastCharTime;
			var oScanError = {};
	        var oEvent;
	        
			switch(true){
				
				// detect codes that are too short
				case (sScanCode.length < oOptions.minLength):
					oScanError = {
						message: "Received code is shorter than minimal length"
					};
					break;
					
				// detect codes that were entered too slow	
				case ((iLastCharTime - iFirstCharTime) > (sScanCode.length * oOptions.avgTimeByChar)):
					oScanError = {
						message: "Received code was not entered in time"
					};				
					break;
					
				// if a code was not filtered out earlier it is valid	
				default:
					oOptions.onScan.call(oDomElement, sScanCode, iSingleScanQty);
					oEvent = new CustomEvent(
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
			
			oEvent = new CustomEvent(
				'scanError', 
				{detail: oScanError}
			);
			oDomElement.dispatchEvent(oEvent);
			
			onScan._reinitialize(oDomElement);
			return false;
	    },
	
	    /**
	     * @private
	     * @param Object oDefaults
	     * @param Object oOptions
	     * @return Object
	     */
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
	
		/**
		 * @private
		 * @param KeyboardEvent e
		 * @return int
		 * @see https://www.w3schools.com/jsref/event_key_keycode.asp
		 */
		_getNormalizedKeyNum: function(e){
			return e.which || e.keyCode;
		},
	
	
		/**
		 * @private
		 * @param KeyboardEvent e
		 * @return void
		 */
		_handleKeyDown: function(e){
			var iKeyCode = onScan._getNormalizedKeyNum(e);
			var oOptions = this.scannerDetectionData.options;
			var oVars = this.scannerDetectionData.vars;
			var bScanFinished = false;
			
			if (oOptions.onKeyDetect.call(this, iKeyCode, e) === false) {
				return;
			}		
			
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
			
			switch(true){
				// If it's not the first character and we encounter a terminating character, trigger scan process
				case (oVars.firstCharTime && oOptions.suffixKeyCodes.indexOf(iKeyCode)!==-1):
					e.preventDefault();
					e.stopImmediatePropagation();
					bScanFinished=true;
					break;
					
				// If it's the first character and we encountered one of the starting characters, don't process the scan	
				case (!oVars.firstCharTime && oOptions.prefixKeyCodes.indexOf(iKeyCode)!==-1):
					e.preventDefault();
					e.stopImmediatePropagation();
					bScanFinished=false;
					break;
					
				// Otherwise, just add the character to the scan string we're building	
				default:
					var character = oOptions.keyCodeMapper.call(this, e);
					if (character === null){
						return;
					}
					oVars.accumulatedString += character;
					
					if (oOptions.preventDefault) {
						e.preventDefault();
					}
					if (oOptions.stopPropagation) {
						e.stopImmediatePropagation();
					}
					
					bScanFinished=false;
					break;
			}
	        
			if(!oVars.firstCharTime){
				oVars.firstCharTime=Date.now();
			}
			
			oVars.lastCharTime=Date.now();
	
			if(oVars.testTimer){ 
				clearTimeout(oVars.testTimer);
			}
			
			if(bScanFinished){
				onScan._validateScanCode(this, oVars.accumulatedString);
				oVars.testTimer=false;
			} else {
				oVars.testTimer=setTimeout(onScan._validateScanCode, oOptions.timeBeforeScanTest, this, oVars.accumulatedString);
			}
	
			oOptions.onKeyProcess.call(this, character, e);
			return;
		},
		
		/**
		 * @private
		 * @param Event e
		 * @return void
		 */
		_handlePaste: function(e){
	
			var oOptions = this.scannerDetectionData.options;
			var oVars = this.scannerDetectionData.vars;
			var sPasteString = (event.clipboardData || window.clipboardData).getData('text');
			
			// if the focus is on an ignored element, abort
			if (onScan._isFocusOnIgnoredElement(this)){
				return;
			}
			
			e.preventDefault();

			if (oOptions.stopPropagation) {
				e.stopImmediatePropagation();
			}
						
			oOptions.onPaste.call(this, sPasteString, event);
			
			oVars.firstCharTime = 0;
			oVars.lastCharTime = 0;
			
			// validate the string
			onScan._validateScanCode(this, sPasteString);
			return;
		},
		
		/**
		 * @private
		 * @param KeyboardEvent e
		 * @return void
		 */
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
			return;
		},
		
		/**
		 * Returns TRUE if the scanner is currently in the middle of a scan sequence.
		 * 
		 * @param DomElement
		 * @return boolean
		 */
		isScanInProgressFor: function(oDomElement) {
			return oDomElement.scannerDetectionData.vars.firstCharTime > 0;
		},
		
		/**
		 * Returns TRUE if onScan is attached to the given DOM element and FALSE otherwise.
		 * 
		 * @param DomElement
		 * @return boolean
		 */
		isAttachedTo: function(oDomElement) {
			return (oDomElement.scannerDetectionData !== undefined);
		}
	};
	
	return onScan;
})));
