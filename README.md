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
document.addEventListener('scan', function(sScancode, iQuatity) {
    alert(iQuantity + 'x ' + sScancode); 
});
```

## Demo & Playground

Here is an [online demo](https://a.kabachnik.info/onscan-js-playground.html). A similar demo is available within the 
package: just load `index.html` in the your after installing to play around with the settings on your own server.

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
| onKeyDetect | function(iKeyCode, oEvent){} | Callback after every detected key event. <br><br>Arguments: <br> - `iKeyCode` - [integer] detected key code <br> - `oEvent` [Event] complete event instance    with the key code to be found in `oEvent.which` (browser differences already normalized) |
| onKeyProcess | function(sChar, oEvent){} | Callback after a key event was decoded and found to be part of a potential scan code. <br><br>Arguments: <br> - `sChar` - [string] decoded character<br> - `oEvent` [Event] complete event instance with the key code to be found in `oEvent.which` (browser differences already normalized) |
| onPaste | function(sPasted, oEvent){}    | Callback after detecting a paste. Only fired if `reactToPaste` is set to `true`. <br><br>Arguments: <br> - `sPasted` - [string] pasted string <br> - `oEvent` - [Event] complete event instance |
| keyCodeMapper    | function(oEvent){<br>  return String.fromCharCode(oEvent.which)<br>} | A function to extract the character from a `keydown` event. The event will be ignored if the function returns `null`. |
| timeBeforeScanTest | 100 | Wait duration (ms) after keypress event to check if scanning finished    |
| avgTimeByChar | 30 | Average time (ms) between 2 chars. If a scan is detected, but it took more time that [code length] * `avgTimeByChar`, a `scanError` will be triggered. |
| minLength    | 6    | Minimum length for a scanned code. If the scan ends before reaching this length, it will trigger a `scanError` event. |
| suffixKeyCodes | [9,13]    | An array with possible suffix codes sent by the scanner after the actual data. Detecting one of them means end of scanning, but they can never be part of the scanned code. Many scanners will send key code `13` (enter) as suffix by default. This can be changed in the configuration in most cases.    |
| prefixKeyCodes    | [] | An array with possible prefix codes sent by the scanner before the actual data. Detecting one of them means start of scanning, but they can never be part of the scanned code. Many scanners support prefix characters in their configuration. |
| ignoreIfFocusOn | false | Ignore scans if the currently focused element matches this selector. For example, if you set this option to `'input'`, scan events will not be fired if an input field is focused. You can either pass an DOMElement, a CSS selector or an array containing multiple besaid objects. |
| scanButtonKeyCode    | false    | Key code of the scanner hardware button (i.e. if the scanner button a acts as a key itself). Knowing this key code is important, because it is not part of the scanned code and must be ignored. |
| scanButtonLongPressTime | 500 | Time (ms) to hold the scan button before `onScanButtonLongPress` is triggered. Only works if `scanButtonKeyCode` is set. |
| stopPropagation | false | Stop immediate propagation of events if they are classified as scans. |
| preventDefault | false | Prevent default action of events if they are classified as scans. |
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
| simulate | DOMElement, sScancode | Fires the `scan` event for the given scan code - usefull to trigger listeners manually (e.g. for testing). |
| setOptions | DOMElement, oOptions | Removes all scanner detection logic from the given DOM element. |
| getOptions | DOMElement | Removes all scanner detection logic from the given DOM element. |

## Credits

This library was inspired by the jQuery plugin [jQuery ScannerDetection](https://github.com/iuyes/jQuery-Scanner-Detection) by Julien Maurel.

## License

onScan.js is an open source project licensed under MIT.

