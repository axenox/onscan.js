# onScan.js

Framework-agnostic JavaScript scan-events for hardware barcode scanners.

## Quick start

1. Install via `npm install onscan.js` or `bower install onscan-js`
2. Include `onscan.min.js` in your script
3. Add the following initilization script to run on page/view load.

```javascript
// Enable scan events for the entire document
onScan.attachTo(document);
// Register event listener
document.addEventListener('scan', function(sScancode, iQuantity) {
    alert(iQuantity + 'x ' + sScancode); 
});
```

## Demo & Playground

[Online demo](https://a.kabachnik.info/onscan-js-playground.html) 

A similar demo is available within the 
package: just load `index.html` from the lib's folder to play around with the settings on your own server.

## Requirements

1) A hardware barcode scanner, that 
    - acts as a keyboard (often called keyboard-wedge-mode), or
    - pastes the scanned codes (clipboard-mode)
2) A more-or-less modern browser (IE9+)

## How it works

onScan.js attempts to distinguish between regular input and scan input by measuring input spead, 
looking for certain prefix and suffix characters, etc. If a scan is detected, it triggers a custom
JavaScript event called `scan` for the DOM element specified during initialization.

There are lot's of options to fine-tune detection of specific scanner models.

There are also a couple of usefull extras (some requiring specifc hardware):

- Passing a counter along with the scanned code
- Adding a secondary action to the hardware button of built-in scanners, if it is long pressed
    
## Some examples

```javascript
// Initialize with options
onScan.attachTo(document, {
    suffixKeyCodes: [13], // enter-key expected at the end of a scan
    reactToPaste: true, // Compatibility to built-in scanners in paste-mode (as opposed to keyboard-mode)
    onScan: function(sCode, iQty) { // Alternative to document.addEventListener('scan')
        console.log('Scanned: ' + iQty + 'x ' + sCode); 
    },
    onKeyDetect: function(iKeyCode){ // output all potentially relevant key events - great for debugging!
        console.log('Pressed: ' + iKeyCode);
    }
});

// Simulate a scan programmatically - e.g. to test event handlers
onScan.simulate(document, '1234567890123');

// Simulate raw keyCodes
onScan.simulate(document, [48,49,50]);

// Simulate keydown events
onScan.simulate(document, [ {keyCode:80, key:'P', shiftKey:true}, {keyCode:49,key:'1'} ]);

// Change options on-the-fly
onScan.setOptions(document, {
    singleScanQty: 5 // change the quantity to 5 for every scan
});

// Remove onScan.js from a DOM element completely
onScan.detachFrom(document);
```

## Options

The following options can be set when initializing onScan.js:

| Option | Default | Description |
| ------ | ------- | ----------- |
| onScan | function(sScanned, iQty){} | Callback after successful scan. <br><br>Arguments: <br> - `sScanned` - [string] scanned code <br> - `iQty` - [integer] quantity |
| onScanButtonLongPress | function(){} | Callback after the scan button was pressed and held down for a time defined in `scanButtonLongPressThreshold`. This can only be used if the scan button behaves as a key itself and the `scanButtonKeyCode` option is set. |
| onScanError | function(oDebug){} | Callback after a scanned string being dropped due to restrictions. <br><br>Arguments: <br> - `oDebug`    - [object] plain object with various debug data|
| onKeyDetect | function(iKeyCode, oEvent){} | Callback after every detected key event. Further event processing can be canceled by returning `false` from this callback - e.g. to exclude certain key events completely. <br><br>Arguments: <br> - `iKeyCode` - [integer] detected key code <br> - `oEvent` [KeyboardEvent] complete event instance |
| onKeyProcess | function(sChar, oEvent){} | Callback after a key event was decoded and found to be part of a potential scan code. Keep in mind, that a this point it is not yet known, whether it's a scan or not - it's just a valid character being processed and decoded. <br><br>Arguments: <br> - `sChar` - [string] decoded character<br> - `oEvent` [KeyboardEvent] complete event instance |
| onPaste | function(sPasted, oEvent){}    | Callback after detecting a paste. Only fired if `reactToPaste` is set to `true`. <br><br>Arguments: <br> - `sPasted` - [string] pasted string <br> - `oEvent` - [Event] complete event instance |
| keyCodeMapper    | onScan.decodeKeyEvent() | A function to extract the character from a `keydown` event. The event will be ignored if the function returns `null`. See chapter "Decoding key codes" below for more information. |
| timeBeforeScanTest | 100 | Wait duration (ms) after keypress event to check if scanning finished    |
| avgTimeByChar | 30 | Average time (ms) between 2 chars. If a scan is detected, but it took more time that [code length] * `avgTimeByChar`, a `scanError` will be triggered. |
| minLength    | 6    | Minimum length for a scanned code. If the scan ends before reaching this length, it will trigger a `scanError` event. |
| suffixKeyCodes | [9,13]    | An array with possible suffix codes sent by the scanner after the actual data. Detecting one of them means end of scanning, but they can never be part of the scanned code. Many scanners will send key code `13` (enter) as suffix by default. This can be changed in the configuration in most cases. <br><br>NOTE: KeyboardEvents with these key codes will be silenced via `event.stopImmediatePropagation()` and `event.preventDefault()`.  |
| prefixKeyCodes    | [] | An array with possible prefix codes sent by the scanner before the actual data. Detecting one of them means start of scanning, but they can never be part of the scanned code. Many scanners support prefix characters in their configuration.<br><br>NOTE: KeyboardEvents with these key codes will be silenced via `event.stopImmediatePropagation()` and `event.preventDefault()`. |
| ignoreIfFocusOn | false | Ignore scans if the currently focused element matches this selector. For example, if you set this option to `'input'`, scan events will not be fired if an input field is focused. You can either pass an DOMElement, a CSS selector or an array containing multiple besaid objects. |
| scanButtonKeyCode    | false    | Key code of the scanner hardware button (i.e. if the scanner button a acts as a key itself). Knowing this key code is important, because it is not part of the scanned code and must be ignored. |
| scanButtonLongPressTime | 500 | Time (ms) to hold the scan button before `onScanButtonLongPress` is triggered. Only works if `scanButtonKeyCode` is set. |
| stopPropagation | false | Stop immediate propagation of events, that are processed successfully.<br><br><b>WARNING:</b> If `reactToKeyDown` is true, every keyboard event, that could potentially be part of a scancode will be stopped! |
| preventDefault | false | Prevent default action of events, that are processed successfully.<br><br><b>WARNING:</b> If `reactToKeyDown` is true, the default of every keyboard event, that could potentially be part of a scancode will be prevented - in particular you won't be able to use the keyboard for typing!!! |
| captureEvents | false | Set to `true` to force all relevant events to be dispatched to onScan _before_ being dispatched to any `EventTarget` beneath it in the DOM tree. Use this if you need to cancel certain events in onScan callbacks. Technically this option is used as the third parameter in `.addEventListener(type, listener [, useCapture])` calls. The exact behavior is documented [here](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener). |
| singleScanQty    | 1    | This is the quantity of items which gets returned on a single successful scan. |
| reactToKeydown | true | Look for scan input among `keydown` events (i.e. if the scanner works in keyboard-mode). |
| reactToPaste | false | Look for scan input among `paste` events (i.e. if the scanner works in clipboard-mode). |


## Events

| Event name | Parameters passed to listener | Description |
| ------ | ------- | ----------- |
| scan | sScanned, iQty | Triggered after successful scan. Handler arguments: <br> - `sScanned` - [string] scanned code <br> - `iQty` - [integer] quantity    |
| scanButtonLongPress | | Triggered after the scan button was pressed and held down for a time defined in `scanButtonLongPressThreshold`. This can only be used if the scan button behaves as a key itself and the `scanButtonKeyCode` option is set. No arguments are passed to the handler. |
| scanError | oDebug | Triggered after a scanned string being dropped due to restrictions. Handler arguments: <br> - `oDebug`    - [object] plain object with various debug data    |

You can register regular event listeners on the DOM element, onScan was initialized for:

```javascript
document
    .addEventListener('scan', function(sScanned, iQty){ ... });
    .addEventListener('scanError', function(oDebug){ ... });
    .addEventListener('scanButtonLongPressed', function(){ ... });
```

You can also define callback directly in the options, when initializing onScan:

```javascript
onScan.attachTo(document, {
    onScan: function(sScanned, iQty) { ... },
    onScanError: function(oDebug) { ... },
    onScanButtonLongPress: function() { ... },
    onKeyDetect: function(iKeyCode, oEvent){ ... }
    onKeyProcess: function(sChar, oEvent){ ... }
    onPaste: function(sPasted){ ... }
});
```

Note: there are more callbacks in the options, than event types. The non-event callbacks are primarily usefull for testing and finding the right configuration for a specific scanner - see playgournd for examples.

## Methods

| Method | Arguments | Description |
| ------ | --------- | ----------- |
| attachTo | DOMElement, oOptions | Initializes listening for scan events for given DOM element. Only events fired for this DOM element will be processed. Use `document` to process all possible events. This is the best pick in most cases. <br><br>NOTE: onScan.js can be attached to a DOM element only once. If you, for some reason, need to call `attachTo()` for a single element multiple times, you must call `detachFrom()` first. |
| detachFrom | DOMElement | Removes all scanner detection logic from the given DOM element. |
| simulate | DOMElement, mStringOrArray | Fires the `scan` event for the given scan code - usefull to trigger listeners manually (e.g. for testing). Accepts either an already decoded string or an array with key codes or event property objects - see below for details. |
| setOptions | DOMElement, oOptions | Replaces only the newly sent options. |
| getOptions | DOMElement | Retrieves entire oOptions object. |
| decodeKeyEvent | Event | Extracts the scanned string character from a keyboard event (i.e. `keydown`) |
| isAttachedTo | DOMElement | Returns `true` if onScan is attached to the given DOM element and `false` otherwise |
| isScanInProgressFor | DOMElement | Returns `true` the scanner is currently in the middle of a scan sequence and `false` otherwise. Technically, this means, that the scan sequence started (e.g. via prefix character) and has not ended yet (e.g. via suffix or timeout). This method is usefull inside event handlers. |

## Decoding key codes

By default, onScan.js ignores any key codes other than those matching letters and numbers. The latter are transformed into characters using built-in browser logic (i.e. the `event.key`). These [key codes](https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) are converted to characters:

- `48`-`90` (letters and regular numbers)
- `96`-`105` (numeric keypad numbers)
- `106`-`111` (numeric keypad operations)

This should work for the vast majority of cases. However, if you encounter strange extra characters in the codes read or miss some characters (like hypens), you can override the default decoding algorithm by specifying a custom `keyCodeMapper` like this:

```javascript
onScan.attachTo(document, {
    onScan: function(sScanned, iQty) { ... },
    keyCodeMapper: function(oEvent) {
	// Look for special keycodes or other event properties specific to
	// your scanner
	if (oEvent.which = 'your_special_key_code') {
		return 'xxx';
	}
	// Fall back to the default decoder in all other cases
	return onScan.decodeKeyEvent(oEvent);
    }
});
```

Background: Barcode scanners operating in keyboard-mode (as opposed to clipboard-mode) work by simulating pressing keyboard keys. They send numeric key codes and the browser interprets them as input. This works great for letters and numbers. However, many barcode scanners also send additional characters depending on their configuration: e.g. the trailing enter (key code `13`), prefix or suffix codes, delimiters, and even their own "virtual" key codes. There are also cases, when key codes are used in a non-standard way. All these cases can be easily treated using a custom `keyCodeMapper` as shown above.

### Simulating key codes

If you do not have your scanner at hand, you can simulate keyboard events programmatically via `onScan.simulate()`. You can pass the desired scan code in the following formats:

- a string - in this case no keyCode decoding is done and the code is merely validated against constraints like minLenght, etc.
- an array of keyCodes (e.g. `[70,71,80]`) - will produce `keydown` events with corresponding `keyCode` properties. NOTE: these events will have empty `key` properties, so decoding may yield different results than with native events.
- an array of objects (e.g. `[{keyCode: 70, key: "F", shiftKey: true}, {keyCode: 71, key: "g"}]`) - this way almost any event can be simulated exactly, but it's a lot of work to do.

Hint: use the `onKeyDetect` checkbox in the playground to get a full dump of each keyboard event an just paste them in your simulation code.

## Credits

This library was inspired by the jQuery plugin [jQuery ScannerDetection](https://github.com/iuyes/jQuery-Scanner-Detection) by Julien Maurel.

## History

See [HISTORY.md](https://github.com/axenox/onscan.js/blob/master/HISTORY.md).

## License

onScan.js is an open source project licensed under MIT.
