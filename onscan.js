var scannerDetector = {		
		attachTo: function(oDomElement, oOptions) {

			if(oDomElement.scannerDetectionData != undefined){
				throw new Error("scannerDetector is already inizialized");
			}

			var oDefaults = {
				onComplete:false, // Callback after detection of a successfull scanning (scanned string in parameter)
				onError:false, // Callback after detection of a unsuccessfull scanning (scanned string in parameter)
				onReceive:false, // Callback after receiving and processing a char (scanned char in parameter)
				onKeyDetect:false, // Callback after detecting a keyDown (key char in parameter) - in contrast to onReceive, this fires for non-character keys like tab, arrows, etc. too!
				timeBeforeScanTest:100, // Wait duration (ms) after keypress event to check if scanning is finished
				avgTimeByChar:30, // Average time (ms) between 2 chars. Used to do difference between keyboard typing and scanning
				minLength:6, // Minimum length for a scanning
				endChar:[9,13], // Chars to remove and means end of scanning
				startChar:[], // Chars to remove and means start of scanning
				ignoreIfFocusOn:false, // do not handle scans if the currently focused element matches this selector
				scanButtonKeyCode:false, // Key code of the scanner hardware button (if the scanner button a acts as a key itself) 
				scanButtonLongPressThreshold:3, // How many times the hardware button should issue a pressed event before a barcode is read to detect a longpress
				onScanButtonLongPressed:false, // Callback after detection of a successfull scan while the scan button was pressed and held down
				stopPropagation:false, // Stop immediate propagation on keypress event
				preventDefault:false // Prevent default action on keypress event
			}
									
			if(typeof oOptions!=="object"){
				oOptions=oDefaults;
			}else{

				oOptions = this._mergeOptions(oDefaults, oOptions);

			}
			oDomElement.scannerDetectionData = {
					options: oOptions,
					vars:{
						firstCharTime: 0,
						lastCharTime: 0,
						stringWriting: '',
						callIsScanner: false,
						scanButtonCounter: 0,
						testTimer: false						
					}
				
			};
			
			this._reinizialize(oDomElement);

			oDomElement.addEventListener("keydown", this._handleKeyDown);
			oDomElement.addEventListener("keypress", this._handleScannerDetection);
			
		},
		
		detachFrom: function(oDomElement) {
			oDomElement.removeEventListener("keydown", this._handleKeyDown);
			oDomElement.removeEventListener("keypress", this._handleScannerDetection);
			oDomElement.scannerDetectionData = undefined; 
			//oDomElement['scannerDetectionData'] = undefined;
			
		},
			
		simulate: function(oDomElement, sTestString){
			var vars = oDomElement['scannerDetectionData'].vars;
			vars.FirstCharTime = 0;
			vars.LastCharTime = 0;
			vars.stringWriting = sTestString;
			this._validateScanCode(oDomElement);
			return this;
		},
		
		_reinizialize: function(oDomElement){
			var vars = oDomElement['scannerDetectionData'].vars;
			vars.firstCharTime=0;
			vars.stringWriting='';
			vars.scanButtonCounter=0;
		},
		
		_isFocusOnIgnoredElement: function(oDomElement){
			
			oIgnoredObject = oDomElement['scannerDetectionData'].options.ignoreIfFocusOn;
	
            if(!oIgnoredObject) return false;
		    if(typeof oIgnoredObject === 'string') return document.activeElement.is(oIgnoredObject); // TODO?
	        if(typeof oIgnoredObject === 'object'){
		        var oFocused = document.activeElement;
				
				if (Array.isArray(oIgnoredObject)){
					for(var i=0; i<oIgnoredObject.length; i++){
						if(Object.is(oFocused, oIgnoredObject[i])){
							return true;
						}
					}
				} else if (Object.is(oFocused, oIgnoredObject)){
					return true;					
				}
				
				
		    }
		    return false;
	    },
		
		_validateScanCode: function(oDomElement, sTestString){
			var oScannerData = oDomElement['scannerDetectionData'];			
			var oOptions = oScannerData.options;
			var sScanCode = oScannerData.vars.stringWriting;
			var iFirstCharTime = oScannerData.vars.firstCharTime;
			var iLastCharTime = oScannerData.vars.lastCharTime;
			var iScanButtonCounter = oScannerData.vars.scanButtonCounter;
			
		    if (!iScanButtonCounter){
		        iScanButtonCounter = 1;
		    }
			
			// If all condition are good (length, time...), call the callback and re-initialize the plugin for next scanning
			// Else, just re-initialize
			if(sScanCode.length>=oOptions.minLength 
				&& iLastCharTime - iFirstCharTime < sScanCode.length * oOptions.avgTimeByChar){
					if(oOptions.onScanButtonLongPressed &&
						iScanButtonCounter > oOptions.scanButtonLongPressThreshold) 
							oOptions.onScanButtonLongPressed.call(oDomElement, sScanCode, iScanButtonCounter);
					else if(oOptions.onComplete) oOptions.onComplete.call(oDomElement, sScanCode, iScanButtonCounter);
					var oEvent = new CustomEvent(
						'scannerDetectionComplete',
						{	
							detail: { 
								code: sScanCode,
								qty: iScanButtonCounter
							}
						}
					);
					oDomElement.dispatchEvent(oEvent);
					scannerDetector._reinizialize(oDomElement);
					return true;
                }else{
                    if(oOptions.onError) oOptions.onError.call(oDomElement,sScanCode);
					
					var oEvent = new CustomEvent('scannerDetectionError');
					oDomElement.dispatchEvent(oEvent);
					
                    scannerDetector._reinizialize(oDomElement);
                    return false;
            }
			
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

		_getKeyNum: function(e){
			var iKeyNum;  
			if(window.event) { // IE                    
			  iKeyNum = e.keyCode;
			} else if(e.which){ // Netscape/Firefox/Opera                   
			  iKeyNum = e.which;
			}
			return iKeyNum;
		},


		_handleKeyDown: function(e){
			var iKeyNum = scannerDetector._getKeyNum(e);  
			var oOptions = this['scannerDetectionData'].options;
			var oVars = this['scannerDetectionData'].vars;

		    if(oOptions.scanButtonKeyCode !== false && iKeyNum==oOptions.scanButtonKeyCode) {
                this['scannerDetectionData'].vars.scanButtonCounter++;
                // Cancel default
                e.preventDefault();
                e.stopImmediatePropagation();
            }
		    // Add event on keydown because keypress is not triggered for non character keys (tab, up, down...)
            // So need that to check endChar and startChar (that is often tab or enter) and call keypress if necessary
            else if((oVars.firstCharTime && oOptions.endChar.indexOf(iKeyNum)!==-1) 
				|| (!oVars.firstCharTime && oOptions.startChar.indexOf(iKeyNum)!==-1)){
					// Clone event, set type and trigger it
					this.dispatchEvent(new KeyboardEvent('keypress',e));

					// Cancel default
					e.preventDefault();
					e.stopImmediatePropagation();
			}
			// Fire keyDetect event in any case!
			if(oOptions.onKeyDetect) oOptions.onKeyDetect.call(this,e);
						
			var oEvent = new CustomEvent(
				'scannerDetectionKeyDetect',
				{	
					evt: e
				}
			);
			this.dispatchEvent(oEvent);


			
		},
		
		_handleScannerDetection: function(e){
			var iKeyNum = scannerDetector._getKeyNum(e);
			var oOptions = this['scannerDetectionData'].options;
			var oVars = this['scannerDetectionData'].vars;
			
			if (scannerDetector._isFocusOnIgnoredElement(this)) return;
			if(oOptions.stopPropagation) e.stopImmediatePropagation();
			if(oOptions.preventDefault) e.preventDefault();

			if(oVars.firstCharTime && oOptions.endChar.indexOf(iKeyNum)!==-1){
				e.preventDefault();
				e.stopImmediatePropagation();
				this['scannerDetectionData'].vars.callIsScanner=true;
			}else if(!oVars.firstCharTime && oOptions.startChar.indexOf(iKeyNum)!==-1){
				e.preventDefault();
				e.stopImmediatePropagation();
				oVars.callIsScanner=false;
			}else{
				if (typeof(iKeyNum) != 'undefined'){
					oVars.stringWriting += String.fromCharCode(iKeyNum);
				}
				oVars.callIsScanner=false;
			}

			if(!oVars.firstCharTime){
				oVars.firstCharTime=Date.now();
			}
			oVars.lastCharTime=Date.now();

			if(oVars.testTimer) clearTimeout(oVars.testTimer);
			if(oVars.callIsScanner){
				scannerDetector._validateScanCode(this);
				oVars.testTimer=false;
			}else{
				oVars.testTimer=setTimeout(scannerDetector._validateScanCode, oOptions.timeBeforeScanTest, this);
			}

			if(oOptions.onReceive) oOptions.onReceive.call(this,e);	

			var oEvent = new CustomEvent(
				'scannerDetectionKeyReceive',
				{	
					evt: e
				}
			);
			this.dispatchEvent(oEvent);

		}	
	};