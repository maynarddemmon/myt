(pkg => {
    let globalKeys,
        
        /* A map of keycodes of the keys currently pressed down. */
        keysDown = {};
    
    const G = pkg.global,
        globalFocus = G.focus,
        
        isFirefox = BrowserDetect.browser === 'Firefox',
        KEYCODE_TAB = 9,
        KEYCODE_SHIFT = 16,
        KEYCODE_CONTROL = 17,
        KEYCODE_ALT = 18,
        KEYCODE_Z = 90,
        KEYCODE_COMMAND = isFirefox ? 224 : 91,
        KEYCODE_RIGHT_COMMAND = isFirefox ? 224 : 93,
        
        getKeyCodeFromEvent = event => pkg.KeyObservable.getKeyCodeFromEvent(event),
        
        /*  Tests if a key is currently pressed down or not. Returns true if 
            the key is down, false otherwise.
                param keyCode:number the key to test. */
        isKeyDown = keyCode => !!keysDown[keyCode],
        
        /* Tests if the 'shift' key is down. */
        isShiftKeyDown = () => isKeyDown(KEYCODE_SHIFT),
        
        /* Tests if the 'control' key is down. */
        isControlKeyDown = () => isKeyDown(KEYCODE_CONTROL),
        
        /* Tests if the 'alt' key is down. */
        isAltKeyDown = () => isKeyDown(KEYCODE_ALT),
        
        /* Tests if the 'command' key is down. */
        isCommandKeyDown = () => isKeyDown(KEYCODE_COMMAND) || isKeyDown(KEYCODE_RIGHT_COMMAND),
        
        /* Tests if the platform specific "accelerator" key is down. */
        isAcceleratorKeyDown = () => BrowserDetect.os === 'Mac' ? isCommandKeyDown() : isControlKeyDown(),
        
        ignoreFocusTrap = () => isAltKeyDown(),
        
        shouldPreventDefault = (keyCode, targetElem) => {
            switch (keyCode) {
                case 8: // Backspace
                    // Catch backspace since it navigates the history. Allow 
                    // it to go through for text input elements though.
                    const nodeName = targetElem.nodeName;
                    if (nodeName === 'TEXTAREA' || 
                        (nodeName === 'INPUT' && (targetElem.type === 'text' || targetElem.type === 'password')) ||
                        (nodeName === 'DIV' && targetElem.contentEditable === 'true' && targetElem.firstChild)
                    ) return false;
                    
                    return true;
                    
                case 9: // Tab
                    // Tab navigation is handled by the framework.
                    return true;
            }
            return false;
        };
    
    /** Provides global keyboard events. Registered with myt.global as 'keys'.
        
        Also works with GlobalFocus to navigate the focus hierarchy when the 
        focus traversal keys are used.
        
        Events:
            keydown:number fired when a key is pressed down. The value is the
                keycode of the key pressed down.
            keypress:number fired when a key is pressed. The value is the
                keycode of the key pressed.
            keyup:number fired when a key is released up. The value is the
                keycode of the key released up.
        
        Keycodes:
            backspace          8
            tab                9
            enter             13
            shift             16
            ctrl              17
            alt               18
            pause/break       19
            caps lock         20
            escape            27
            spacebar          32
            page up           33
            page down         34
            end               35
            home              36
            left arrow        37
            up arrow          38
            right arrow       39
            down arrow        40
            insert            45
            delete            46
            0                 48
            1                 49
            2                 50
            3                 51
            4                 52
            5                 53
            6                 54
            7                 55
            8                 56
            9                 57
            a                 65
            b                 66
            c                 67
            d                 68
            e                 69
            f                 70
            g                 71
            h                 72
            i                 73
            j                 74
            k                 75
            l                 76
            m                 77
            n                 78
            o                 79
            p                 80
            q                 81
            r                 82
            s                 83
            t                 84
            u                 85
            v                 86
            w                 87
            x                 88
            y                 89
            z                 90
            left window key   91
            right window key  92
            select key        93
            numpad 0          96
            numpad 1          97
            numpad 2          98
            numpad 3          99
            numpad 4         100
            numpad 5         101
            numpad 6         102
            numpad 7         103
            numpad 8         104
            numpad 9         105
            multiply         106
            add              107
            subtract         109
            decimal point    110
            divide           111
            f1               112
            f2               113
            f3               114
            f4               115
            f5               116
            f6               117
            f7               118
            f8               119
            f9               120
            f10              121
            f11              122
            f12              123
            num lock         144
            scroll lock      145
            semi-colon       186
            equal sign       187
            comma            188
            dash             189
            period           190
            forward slash    191
            grave accent     192
            open bracket     219
            back slash       220
            close braket     221
            single quote     222
        
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
            
            // Constants
            globalKeys.KEYCODE_TAB = KEYCODE_TAB;
            globalKeys.KEYCODE_SHIFT = KEYCODE_SHIFT;
            globalKeys.KEYCODE_CONTROL = KEYCODE_CONTROL;
            globalKeys.KEYCODE_ALT = KEYCODE_ALT;
            globalKeys.KEYCODE_Z = KEYCODE_Z;
            globalKeys.KEYCODE_COMMAND = KEYCODE_COMMAND;
            globalKeys.KEYCODE_RIGHT_COMMAND = KEYCODE_RIGHT_COMMAND;
            
            globalKeys.setDomElement(document);
            globalKeys.attachTo(globalFocus, '__handleFocused', 'focused');
            globalKeys.__listenToDocument();
            
            // Clear keys down when the window loses focus. This is necessary 
            // when using keyboard shortcusts to switch apps since that will 
            // leave a key in the down state even though it may no longer be 
            // when the focus is returned to the page.
            global.onblur = () => {keysDown = {};};
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        isKeyDown: isKeyDown,
        isShiftKeyDown: isShiftKeyDown,
        isControlKeyDown: isControlKeyDown,
        isAltKeyDown: isAltKeyDown,
        isCommandKeyDown: isCommandKeyDown,
        isAcceleratorKeyDown: isAcceleratorKeyDown,
        
        ignoreFocusTrap: ignoreFocusTrap,
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __handleFocused: event => {
            const focused = event.value;
            if (focused) {
                // unlisten to document
                globalKeys.detachFromDom(globalKeys, '__handleKeyDown', 'keydown');
                globalKeys.detachFromDom(globalKeys, '__handleKeyPress', 'keypress');
                globalKeys.detachFromDom(globalKeys, '__handleKeyUp', 'keyup');
                
                globalKeys.attachToDom(focused, '__handleKeyDown', 'keydown');
                globalKeys.attachToDom(focused, '__handleKeyPress', 'keypress');
                globalKeys.attachToDom(focused, '__handleKeyUp', 'keyup');
            } else {
                const prevFocused = globalFocus.prevFocusedView;
                if (prevFocused) {
                    globalKeys.detachFromDom(prevFocused, '__handleKeyDown', 'keydown');
                    globalKeys.detachFromDom(prevFocused, '__handleKeyPress', 'keypress');
                    globalKeys.detachFromDom(prevFocused, '__handleKeyUp', 'keyup');
                }
                
                globalKeys.__listenToDocument();
            }
        },
        
        /** @private
            @returns {undefined} */
        __listenToDocument: () => {
            globalKeys.attachToDom(globalKeys, '__handleKeyDown', 'keydown');
            globalKeys.attachToDom(globalKeys, '__handleKeyPress', 'keypress');
            globalKeys.attachToDom(globalKeys, '__handleKeyUp', 'keyup');
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __handleKeyDown: event => {
            const keyCode = getKeyCodeFromEvent(event),
                domEvent = event.value;
            if (shouldPreventDefault(keyCode, domEvent.target)) domEvent.preventDefault();
            
            // Keyup events do not fire when command key is down so fire a keyup
            // event immediately. Not an issue for other meta keys: shift, ctrl 
            // and option.
            if (isCommandKeyDown() && keyCode !== KEYCODE_SHIFT && keyCode !== KEYCODE_CONTROL && keyCode !== KEYCODE_ALT) {
                globalKeys.fireEvent('keydown', keyCode);
                globalKeys.fireEvent('keyup', keyCode);
            } else {
                keysDown[keyCode] = true;
                
                // Check for 'tab' key and do focus traversal.
                if (keyCode === KEYCODE_TAB) {
                    const ift = ignoreFocusTrap();
                    if (isShiftKeyDown()) {
                        globalFocus.prev(ift);
                    } else {
                        globalFocus.next(ift);
                    }
                }
                
                globalKeys.fireEvent('keydown', keyCode);
            }
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __handleKeyPress: event => {
            globalKeys.fireEvent('keypress', getKeyCodeFromEvent(event));
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __handleKeyUp: event => {
            const keyCode = getKeyCodeFromEvent(event),
                domEvent = event.value;
            if (shouldPreventDefault(keyCode, domEvent.target)) domEvent.preventDefault();
            keysDown[keyCode] = false;
            globalKeys.fireEvent('keyup', keyCode);
        }
    });
})(myt);
