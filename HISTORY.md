# onScan.js - version history

### 1.5

- NEW method `onScan.isScanInProgressFor()` to test if a potential keyboard scan is in progress
- NEW option `captureEvents` to make sure onScan gets events before any other listerer below in the DOM

### 1.4.3

- NEW `onScan.simulate()` now accepts arrays of key codes or event properties
- FIX shiftKey detection was not working

### 1.4.2

- FIX missing update of min-version for 1.4.1
- FIX further improvements for key code normalization

### 1.4.1

- FIX default keyboard event decoder

### 1.4

- Improved default key code decoder: ignore non-alphanumeric characters, case sensitive now, etc.
- Wrapped onScan as a JS module
- Fixed JS errors in browsers, that do not allow overriding KeyboardEvent.which

### 1.3.2

- FIX option `ignoreIfFocusOn` not working

### 1.3.0

- Added option `reactToKeydown` to disable keyboard-mode if favor of clipboard-mode only
- Cleaned up API
- Improved README
- Added LICENSE and HISTORY.md

### 1.2.0

- Added support for NPM

### 1.0.0

- Initial release

