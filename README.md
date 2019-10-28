onscan.js - Scanner Detection (without jQuery)
==============================================

onscan.js is a small plugin for detecting the use of barcodescanners. The user can do serveral conigurations, define callbacks for specific purpouses or choose between input-methods.

How to use it
-------------
To initialize the detection, use
	
	scannerDetection.attatchTo(DOMElement); // Initialize attached to object with default options
    scannerDetection.attatchTo(DOMElement, {...}); // Initialize attached to object with an object that contains options
	
To change the settings after initialization:
	
	scannerDetection.setOptionsOf([DOMElement], {...}); // The object has to contain the option names and values (see options down below)

To view the current settings after initialization:

	scannerDetection.getOptionsOf(DOMElement);

To simulate a scanning after initialization:

	scannerDetection.simulate([DOMElement], [Scanned String]);

To detatch the scanner from an object

	scannerDetection.detatchFrom(DOMElement);


There can only be one scannerDetector per element at once.

Options
-------

| Option          				| Default           | Description 																																																																																																																																																						|
| ----------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| onComplete					| function(){}		| Callback after detection of a successful scanning																																																																																																																																													|
| onError						| function(){}		| Callback after detection of a unsuccessful scanning (scanned string in parameter)																																																																																																																																					|
| onReceive						| function(){}		| Callback after receiving and processing a char (scanned char in parameter)																																																																																																																																						|
| onKeyDetect					| function(){}		| Callback after detecting a keyDown (key char in parameter) - in contrast to onReceive, this fires for non-character keys like tab, arrows, etc. too!																																																																																																																				|
| onScanButtonLongPressed		| function(){}		| Callback after the scan button was pressed and held down for a time defined in scanButtonLongPressThreshold. This can only be used if the scan button behaves as a key itself (see scanButtonKeyCode). This long press event can be used to add a secondary action. For example, if the primary action is to count some items with barcodes (e.g. products at goods-in), it is comes very handy if a number pad pops up on the screen when the scan button is held. Large number can then be easily typed it instead of scanning fifty times in a row. (this option requires scanButtonKeyCode to be set to a valid key code!)	|
| onPaste						| function(){}		| Callback after receiving a value on paste, no matter if it is a valid code or not. Does need acceptPasteInput set on true to work.																																																																																																																								|
| keyCodeMapper					| function(){}		| Function for adding own keyMapping-Methods (keydown event in parameter, requires char as return-value). If the method returns null, keyevent gets ignored. If the method returns undefined the js fromCharCode function gets used.																																																																																																|
| timeBeforeScanTest			| 100 				| Wait duration (ms) after keypress event to check if scanning is finished																																																																																																																																							|
| avgTimeByChar					| 30				| Average time (ms) between 2 chars. Used to do difference between keyboard typing and scanning																																																																																																																																		|
| minLength						| 6					| Minimum length for a scanning																																																																																																																																																		|
| endChar						| [9,13]			| Chars to remove and means end of scanning																																																																																																																																															|
| startChar						| []				| Chars to remove and means start of scanning																																																																																																																																														|
| ignoreIfFocusOn				| false  			| Ignore scans if the currently focused element matches this selector. Per example, if you set this option to 'input', scanner detection will be disable if an input is focused, when the scan occurs. You can either pass an DOMElement, the ID of an DOMElement or an array, containing the prior named objects.																																																																													|
| scanButtonKeyCode				| false				| Key code of the scanner hardware button (if the scanner button a acts as a key itself). Knowing this key code is important, because it is not part of the scanned code and must be ignored.																																																																																																										|
| scanButtonLongPressThreshold	| 500				| You can let the user perform some special action by pressing and holding the scan button. In this case the plugin will fire an callback (set in onScanButtonLongPressed), after a defined button was pressed for a time defined in this option (in ms).																																																																																											|
| stopPropagation				| false				| Stop immediate propagation on keypress event																																																																																																																																														|
| preventDefault				| false				| Prevent default action on keypress event																																																																																																																																															|
| singleScanQty					| 1					| This is the quantity of items which gets returned on a single successful scan. 																																																																																																																																					|
| acceptPasteInput				| false				| This setting allows you to accept codes, put in via paste event. Some barcodescanners might only work with the use this parameter.																																																																																																																								|


Events
------
All callbacks are of type function and can also be bound as event listeners.  
Like this, you can add multiple callbacks for each event.  
Of course, events exist only if plugin is initialized on selector.

    DOMElement
        .addEventListener('scan', function(e){...});
        .addEventListener('scanError', function(e){...});
		.addEventListener('scannerDetectionKeyReceive', function(e){...});
        .addEventListener('scannerDetectionKeyDetect',function(e){...})

###scan
Callback after detection of a successful scanning  
Event data: detail:{
	scanCode: "scanned String",
	qty: "quantity set in option iSingleScanQty"
} 
###scanError
Callback after detection of a unsuccessful scanning  
Event data: detail:{
	scanCode: "scanned String",
	message: "errormessage",
	scanDuration: "time elapsed during input of code (ms)",
	avgTimeByChar: "time set in option",
	minLength: "minimum length of a valid string set in options"
}  
###scannerDetectionKReceive
Callback after receive and process a char  
Event data: {evt: {original keypress event}}
###scannerDetectionKeyDetect
Callback after detecting a keyDown - in contrast to onReceive, this fires for non-character keys like tab, arrows, etc. too!
Event data: {evt: {original keypress event}}

Browser compatibility
---------------------
On old IE browser (IE<9), `Date.now()` and `Array.indexOf()` are not implemented.  

