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
    
    Attributes:
        _keysDown:object A map of keycodes of the keys currently pressed down.
    
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
*/
new JS.Singleton('GlobalKeys', {
    include: [
        myt.DomElementProxy, 
        myt.DomObservable,
        myt.DomObserver,
        myt.KeyObservable,
        myt.Observable,
        myt.Observer
    ],
    
    
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function() {
        // Constants
        this.KEYCODE_SHIFT = 16;
        this.KEYCODE_CONTROL = 17;
        this.KEYCODE_ALT = 18;
        
        this.setDomElement(document);
        this.attachTo(myt.global.focus, '_handleFocused', 'focused');
        this._keysDown = {};
        this._listenToDocument();
        
        myt.global.register('keys', this);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Tests if a key is currently pressed down or not.
        @param keyCode:number the key to test.
        @returns true if the key is down, false otherwise. */
    isKeyDown: function(keyCode) {
        return !!this._keysDown[keyCode];
    },
    
    /** Tests if the 'shift' key is down. */
    isShiftKeyDown: function() {return this.isKeyDown(this.KEYCODE_SHIFT);},
    
    /** Tests if the 'control' key is down. */
    isControlKeyDown: function() {return this.isKeyDown(this.KEYCODE_CONTROL);},
    
    /** Tests if the 'alt' key is down. */
    isAltKeyDown: function() {return this.isKeyDown(this.KEYCODE_ALT);},
    
    _handleFocused: function(e) {
        var focused = e.value;
        if (focused) {
            this._unlistenToDocument();
            
            this.attachToDom(focused, '_handleKeyDown', 'keydown');
            this.attachToDom(focused, '_handleKeyPress', 'keypress');
            this.attachToDom(focused, '_handleKeyUp', 'keyup');
        } else {
            var prevFocused = myt.global.focus.prevFocusedView;
            if (prevFocused) {
                this.detachFromDom(prevFocused, '_handleKeyDown', 'keydown');
                this.detachFromDom(prevFocused, '_handleKeyPress', 'keypress');
                this.detachFromDom(prevFocused, '_handleKeyUp', 'keyup');
            }
            
            this._listenToDocument();
        }
    },
    
    _listenToDocument: function() {
        this.attachToDom(this, '_handleKeyDown', 'keydown');
        this.attachToDom(this, '_handleKeyPress', 'keypress');
        this.attachToDom(this, '_handleKeyUp', 'keyup');
    },
    
    _unlistenToDocument: function() {
        this.detachFromDom(this, '_handleKeyDown', 'keydown');
        this.detachFromDom(this, '_handleKeyPress', 'keypress');
        this.detachFromDom(this, '_handleKeyUp', 'keyup');
    },
    
    _handleKeyDown: function(event) {
        var keyCode = myt.KeyObservable.getKeyCodeFromEvent(event),
            domEvent = event.value;
        if (this._shouldPreventDefault(keyCode, domEvent.target)) domEvent.preventDefault();
        this._keysDown[keyCode] = true;
        
        // Check for 'tab' key and do focus traversal.
        if (keyCode === 9) {
            if (this.isShiftKeyDown()) {
                myt.global.focus.prev(this.isAltKeyDown());
            } else {
                myt.global.focus.next(this.isAltKeyDown());
            }
        }
        
        this.fireNewEvent('keydown', keyCode);
        //console.log('global keydown', keyCode);
    },
    
    _handleKeyPress: function(event) {
        var keyCode = myt.KeyObservable.getKeyCodeFromEvent(event);
        this.fireNewEvent('keypress', keyCode);
        //console.log('global keypress', keyCode);
    },
    
    _handleKeyUp: function(event) {
        var keyCode = myt.KeyObservable.getKeyCodeFromEvent(event),
            domEvent = event.value;
        if (this._shouldPreventDefault(keyCode, domEvent.target)) domEvent.preventDefault();
        this._keysDown[keyCode] = false;
        this.fireNewEvent('keyup', keyCode);
        //console.log('global keyup', keyCode);
    },
    
    _shouldPreventDefault: function(keyCode, targetElem) {
        switch (keyCode) {
            case 8: // Backspace
                // Catch backspace since it navigates the history. Allow it to
                // go through for text input elements though.
                if (targetElem.nodeName === 'TEXTAREA' || 
                    (targetElem.nodeName === 'INPUT' && (targetElem.type === 'text' || targetElem.type === 'password'))
                ) {
                    return false;
                } else {
                    return true;
                }
            case 9: // Tab
                // Tab navigation is handled by the framework.
                return true;
        }
        return false;
    }
});
