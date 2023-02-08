(pkg => {
    let globalKeys,
        
        /*  A map of codes of the keys currently pressed down. */
        keysDown = {};
    
    const G = pkg.global,
        globalFocus = G.focus,
        
        isFirefox = BrowserDetect.browser === 'Firefox',
        
        CODE_TAB = 'Tab',
        CODE_SHIFT_LEFT = 'ShiftLeft',
        CODE_SHIFT_RIGHT = 'ShiftRight',
        CODE_ALT_LEFT = 'AltLeft',
        CODE_ALT_RIGHT = 'AltRight',
        CODE_CONTROL_LEFT = 'ControlLeft',
        CODE_CONTROL_RIGHT = 'ControlRight',
        CODE_META_LEFT = isFirefox ? 'OSLeft' : 'MetaLeft',
        CODE_META_RIGHT = isFirefox ? 'OSRight' : 'MetaRight',
        CODE_BACKSPACE = 'Backspace',
        
        getCodeFromEvent = pkg.KeyObservable.getCodeFromEvent,
        
        isShiftCode = code => code === CODE_SHIFT_LEFT || code === CODE_SHIFT_RIGHT,
        isControlCode = code => code === CODE_CONTROL_LEFT || code === CODE_CONTROL_RIGHT,
        isAltCode = code => code === CODE_ALT_LEFT || code === CODE_ALT_RIGHT,
        
        /*  Tests if a key is currently pressed down or not. Returns true if 
            the key is down, false otherwise.
                param code:string the key code to test. */
        isKeyDown = code => !!keysDown[code],
        
        /*  Tests if the 'shift' key is down. */
        isShiftKeyDown = () => isKeyDown(CODE_SHIFT_LEFT) || isKeyDown(CODE_SHIFT_RIGHT),
        
        /*  Tests if the 'control' key is down. */
        isControlKeyDown = () => isKeyDown(CODE_CONTROL_LEFT) || isKeyDown(CODE_CONTROL_RIGHT),
        
        /*  Tests if the 'alt' key is down. */
        isAltKeyDown = () => isKeyDown(CODE_ALT_LEFT) || isKeyDown(CODE_ALT_RIGHT),
        
        /*  Tests if the 'meta'/'command' key is down. */
        isMetaKeyDown = () => isKeyDown(CODE_META_LEFT) || isKeyDown(CODE_META_RIGHT),
        
        ignoreFocusTrap = () => isAltKeyDown(),
        
        shouldPreventDefault = (code, targetElem) => {
            switch (code) {
                case CODE_BACKSPACE: // Backspace
                    // Catch backspace since it navigates the history. Allow 
                    // it to go through for text input elements though.
                    const nodeName = targetElem.nodeName;
                    return !(
                        nodeName === 'TEXTAREA' || 
                        (nodeName === 'INPUT' && (targetElem.type === 'text' || targetElem.type === 'number' || targetElem.type === 'password')) ||
                        (nodeName === 'DIV' && targetElem.contentEditable === 'true' && targetElem.firstChild)
                    );
                case CODE_TAB: // Tab
                    // Tab navigation is handled by the framework.
                    return true;
            }
            return false;
        },
        
        registerEventHandler = (target, action) => {
            ['keydown','keypress','keyup'].forEach(eventName => {
                globalKeys[action](target, '__hndl_' + eventName, eventName);
            });
        },
        attach = target => {registerEventHandler(target, 'attachToDom');},
        detach = target => {registerEventHandler(target, 'detachFromDom');};
    
    /** Provides global keyboard events. Registered with myt.global as 'keys'.
        
        Also works with GlobalFocus to navigate the focus hierarchy when the 
        focus traversal keys are used.
        
        Events:
            keydown:string fired when a key is pressed down. The value is the
                code of the key pressed down.
            keypress:string fired when a key is pressed. The value is the
                code of the key pressed.
            keyup:string fired when a key is released up. The value is the
                code of the key released up.
        
        @class */
    new JS.Singleton('GlobalKeys', {
        include: [
            pkg.DomElementProxy,
            pkg.DomObservable,
            pkg.DomObserver,
            pkg.KeyObservable,
            pkg.Observable,
            pkg.Observer
        ],
        
        
        // Constructor /////////////////////////////////////////////////////////
        initialize: function() {
            G.register('keys', globalKeys = this);
            
            // Exposed Key Code Constants
            globalKeys.CODE_ENTER = 'Enter'; // Was KeyCode 13
            globalKeys.CODE_ESC = 'Escape'; // Was KeyCode 27
            globalKeys.CODE_SPACE = 'Space'; // Was Keycode 32
            globalKeys.CODE_ARROW_LEFT = 'ArrowLeft'; // Was Keycode 37
            globalKeys.CODE_ARROW_UP = 'ArrowUp'; // Was Keycode 38
            globalKeys.CODE_ARROW_RIGHT = 'ArrowRight'; // Was Keycode 39
            globalKeys.CODE_ARROW_DOWN = 'ArrowDown'; // Was Keycode 40
            globalKeys.CODE_DELETE = 'Delete'; // Was Keycode 46
            globalKeys.CODE_BACKSPACE = CODE_BACKSPACE; // Was Keycode 8
            ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'].forEach(key => {
                globalKeys['CODE_' + key] = 'Key' + key;
            });
            ['1','2','3','4','5','6','7','8','9','0'].forEach(key => {
                globalKeys['CODE_' + key] = 'Digit' + key;
            });
            
            globalKeys.ARROW_KEYS = [globalKeys.CODE_ARROW_LEFT, globalKeys.CODE_ARROW_UP, globalKeys.CODE_ARROW_RIGHT, globalKeys.CODE_ARROW_DOWN];
            globalKeys.LIST_KEYS = [globalKeys.CODE_ENTER, globalKeys.CODE_SPACE, globalKeys.CODE_ESC].concat(globalKeys.ARROW_KEYS);
            
            
            globalKeys.setDomElement(document);
            globalKeys.attachTo(globalFocus, '__hndl_focused', 'focused');
            attach(globalKeys);
            
            // Clear keys down when the window loses focus. This is necessary 
            // when using keyboard shortcusts to switch apps since that will 
            // leave a key in the down state even though it may no longer be 
            // when the focus is returned to the page.
            global.onblur = () => {keysDown = {};};
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        isShiftKeyDown: isShiftKeyDown,
        isControlKeyDown: isControlKeyDown,
        isAltKeyDown: isAltKeyDown,
        isMetaKeyDown: isMetaKeyDown,
        
        isShiftCode: isShiftCode,
        isControlCode: isControlCode,
        isAltCode: isAltCode,
        
        /** Tests if the platform specific "accelerator" key is down. */
        isAcceleratorKeyDown: () => BrowserDetect.os === 'Mac' ? isMetaKeyDown() : isControlKeyDown(),
        
        ignoreFocusTrap: ignoreFocusTrap,
        
        /** Switch what is being listened to as focus changes. By default the
            document is listened to for key events.
            @private
            @param {!Object} event
            @returns {undefined} */
        __hndl_focused: event => {
            const focused = event.value;
            if (focused) {
                detach(globalKeys);
                attach(focused);
            } else {
                const prevFocused = globalFocus.prevFocusedView;
                if (prevFocused) detach(prevFocused);
                attach(globalKeys);
            }
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __hndl_keydown: event => {
            const code = getCodeFromEvent(event),
                domEvent = event.value;
            if (shouldPreventDefault(code, domEvent.target)) domEvent.preventDefault();
            
            // Keyup events do not fire when command key is down so fire a keyup event immediately. 
            // Not an issue for other meta keys: shift, ctrl and option.
            if (isMetaKeyDown() && !isShiftCode(code) && !isControlCode(code) && !isAltCode(code)) {
                globalKeys.fireEvent('keydown', code);
                globalKeys.fireEvent('keyup', code);
            } else {
                keysDown[code] = true;
                
                // Check for 'tab' key and do focus traversal.
                if (code === CODE_TAB) {
                    const ift = ignoreFocusTrap();
                    if (isShiftKeyDown()) {
                        globalFocus.prev(ift);
                    } else {
                        globalFocus.next(ift);
                    }
                }
                
                globalKeys.fireEvent('keydown', code);
            }
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __hndl_keypress: event => {
            globalKeys.fireEvent('keypress', getCodeFromEvent(event));
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __hndl_keyup: event => {
            const code = getCodeFromEvent(event),
                domEvent = event.value;
            if (shouldPreventDefault(code, domEvent.target)) domEvent.preventDefault();
            keysDown[code] = false;
            globalKeys.fireEvent('keyup', code);
        }
    });
})(myt);
