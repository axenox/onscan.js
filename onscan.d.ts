export function attachTo(oDomElement: any, oOptions: any): {
    /**
     *
     * @param DomElement oDomElement
     * @param Object oOptions
     * @return self
     */
    attachTo: (oDomElement: any, oOptions: any) => any;
    /**
     *
     * @param DomElement oDomElement
     * @return void
     */
    detachFrom: (oDomElement: any) => void;
    /**
     *
     * @param DomElement oDomElement
     * @return Object
     */
    getOptions: (oDomElement: any) => any;
    /**
     *
     * @param DomElement oDomElement
     * @param Object oOptions
     * @return self
     */
    setOptions: (oDomElement: any, oOptions: any) => any;
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
    decodeKeyEvent: (oEvent: any) => any;
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
    simulate: (oDomElement: any, mStringOrArray: any) => any;
    /**
     * @private
     * @param DomElement oDomElement
     * @return void
     */
    _reinitialize: (oDomElement: any) => void;
    /**
     * @private
     * @param DomElement oDomElement
     * @return boolean
     */
    _isFocusOnIgnoredElement: (oDomElement: any) => boolean;
    /**
     * Validates the scan code accumulated by the given DOM element and fires the respective events.
     *
     * @private
     * @param DomElement oDomElement
     * @return boolean
     */
    _validateScanCode: (oDomElement: any, sScanCode: any) => boolean;
    /**
     * @private
     * @param Object oDefaults
     * @param Object oOptions
     * @return Object
     */
    _mergeOptions: (oDefaults: any, oOptions: any) => {};
    /**
     * @private
     * @param KeyboardEvent e
     * @return int
     * @see https://www.w3schools.com/jsref/event_key_keycode.asp
     */
    _getNormalizedKeyNum: (e: any) => any;
    /**
     * @private
     * @param KeyboardEvent e
     * @return void
     */
    _handleKeyDown: (e: any) => void;
    /**
     * @private
     * @param Event e
     * @return void
     */
    _handlePaste: (e: any) => void;
    /**
     * @private
     * @param KeyboardEvent e
     * @return void
     */
    _handleKeyUp: (e: any) => void;
    /**
     * Returns TRUE if the scanner is currently in the middle of a scan sequence.
     *
     * @param DomElement
     * @return boolean
     */
    isScanInProgressFor: (oDomElement: any) => boolean;
    /**
     * Returns TRUE if onScan is attached to the given DOM element and FALSE otherwise.
     *
     * @param DomElement
     * @return boolean
     */
    isAttachedTo: (oDomElement: any) => boolean;
};
export function detachFrom(oDomElement: any): void;
export function getOptions(oDomElement: any): any;
export function setOptions(oDomElement: any, oOptions: any): {
    /**
     *
     * @param DomElement oDomElement
     * @param Object oOptions
     * @return self
     */
    attachTo: (oDomElement: any, oOptions: any) => any;
    /**
     *
     * @param DomElement oDomElement
     * @return void
     */
    detachFrom: (oDomElement: any) => void;
    /**
     *
     * @param DomElement oDomElement
     * @return Object
     */
    getOptions: (oDomElement: any) => any;
    /**
     *
     * @param DomElement oDomElement
     * @param Object oOptions
     * @return self
     */
    setOptions: (oDomElement: any, oOptions: any) => any;
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
    decodeKeyEvent: (oEvent: any) => any;
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
    simulate: (oDomElement: any, mStringOrArray: any) => any;
    /**
     * @private
     * @param DomElement oDomElement
     * @return void
     */
    _reinitialize: (oDomElement: any) => void;
    /**
     * @private
     * @param DomElement oDomElement
     * @return boolean
     */
    _isFocusOnIgnoredElement: (oDomElement: any) => boolean;
    /**
     * Validates the scan code accumulated by the given DOM element and fires the respective events.
     *
     * @private
     * @param DomElement oDomElement
     * @return boolean
     */
    _validateScanCode: (oDomElement: any, sScanCode: any) => boolean;
    /**
     * @private
     * @param Object oDefaults
     * @param Object oOptions
     * @return Object
     */
    _mergeOptions: (oDefaults: any, oOptions: any) => {};
    /**
     * @private
     * @param KeyboardEvent e
     * @return int
     * @see https://www.w3schools.com/jsref/event_key_keycode.asp
     */
    _getNormalizedKeyNum: (e: any) => any;
    /**
     * @private
     * @param KeyboardEvent e
     * @return void
     */
    _handleKeyDown: (e: any) => void;
    /**
     * @private
     * @param Event e
     * @return void
     */
    _handlePaste: (e: any) => void;
    /**
     * @private
     * @param KeyboardEvent e
     * @return void
     */
    _handleKeyUp: (e: any) => void;
    /**
     * Returns TRUE if the scanner is currently in the middle of a scan sequence.
     *
     * @param DomElement
     * @return boolean
     */
    isScanInProgressFor: (oDomElement: any) => boolean;
    /**
     * Returns TRUE if onScan is attached to the given DOM element and FALSE otherwise.
     *
     * @param DomElement
     * @return boolean
     */
    isAttachedTo: (oDomElement: any) => boolean;
};
export function decodeKeyEvent(oEvent: any): any;
export function simulate(oDomElement: any, mStringOrArray: any): {
    /**
     *
     * @param DomElement oDomElement
     * @param Object oOptions
     * @return self
     */
    attachTo: (oDomElement: any, oOptions: any) => any;
    /**
     *
     * @param DomElement oDomElement
     * @return void
     */
    detachFrom: (oDomElement: any) => void;
    /**
     *
     * @param DomElement oDomElement
     * @return Object
     */
    getOptions: (oDomElement: any) => any;
    /**
     *
     * @param DomElement oDomElement
     * @param Object oOptions
     * @return self
     */
    setOptions: (oDomElement: any, oOptions: any) => any;
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
    decodeKeyEvent: (oEvent: any) => any;
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
    simulate: (oDomElement: any, mStringOrArray: any) => any;
    /**
     * @private
     * @param DomElement oDomElement
     * @return void
     */
    _reinitialize: (oDomElement: any) => void;
    /**
     * @private
     * @param DomElement oDomElement
     * @return boolean
     */
    _isFocusOnIgnoredElement: (oDomElement: any) => boolean;
    /**
     * Validates the scan code accumulated by the given DOM element and fires the respective events.
     *
     * @private
     * @param DomElement oDomElement
     * @return boolean
     */
    _validateScanCode: (oDomElement: any, sScanCode: any) => boolean;
    /**
     * @private
     * @param Object oDefaults
     * @param Object oOptions
     * @return Object
     */
    _mergeOptions: (oDefaults: any, oOptions: any) => {};
    /**
     * @private
     * @param KeyboardEvent e
     * @return int
     * @see https://www.w3schools.com/jsref/event_key_keycode.asp
     */
    _getNormalizedKeyNum: (e: any) => any;
    /**
     * @private
     * @param KeyboardEvent e
     * @return void
     */
    _handleKeyDown: (e: any) => void;
    /**
     * @private
     * @param Event e
     * @return void
     */
    _handlePaste: (e: any) => void;
    /**
     * @private
     * @param KeyboardEvent e
     * @return void
     */
    _handleKeyUp: (e: any) => void;
    /**
     * Returns TRUE if the scanner is currently in the middle of a scan sequence.
     *
     * @param DomElement
     * @return boolean
     */
    isScanInProgressFor: (oDomElement: any) => boolean;
    /**
     * Returns TRUE if onScan is attached to the given DOM element and FALSE otherwise.
     *
     * @param DomElement
     * @return boolean
     */
    isAttachedTo: (oDomElement: any) => boolean;
};
export function _reinitialize(oDomElement: any): void;
export function _isFocusOnIgnoredElement(oDomElement: any): boolean;
export function _validateScanCode(oDomElement: any, sScanCode: any): boolean;
export function _mergeOptions(oDefaults: any, oOptions: any): {};
export function _getNormalizedKeyNum(e: any): any;
export function _handleKeyDown(e: any): void;
export function _handlePaste(e: any): void;
export function _handleKeyUp(e: any): void;
export function isScanInProgressFor(oDomElement: any): boolean;
export function isAttachedTo(oDomElement: any): boolean;
