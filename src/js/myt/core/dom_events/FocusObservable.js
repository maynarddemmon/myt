/** Generates focus and blur events and passes them on to one or more 
    event observers. Also provides focus related events to a view. When a view
    is focused or blurred, myt.global.focus will be notified via the
    'notifyFocus' and 'notifyBlur' methods.
    
    Requires myt.DomObservable as a super mixin.
    
    Events:
        focused:object Fired when this view gets focus. The value is this view.
        focus:object Fired when this view gets focus. The value is a dom
            focus event.
        blur:object Fired when this view loses focus. The value is a dom
            focus event.
    
    Attributes:
        focused:boolean Indicates if this view has focus or not.
        focusable:boolean Indicates if this view can have focus or not.
        focusEmbellishment:boolean Indicates if the focus embellishment should
            be shown for this view or not when it has focus.
    
    Virtual Methods:
        getNextFocus() Implement this method to return the next view that 
            should have focus. If null is returned or the method is not 
            implemented, normal dom traversal will occur.
        getPrevFocus() Implement this method to return the prev view that 
            should have focus. If null is returned or the method is not 
            implemented, normal dom traversal will occur.
*/
// TODO: fire focus and blur events rather than a focused event?
// FIXME: should we give away focus when we become not visible?
myt.FocusObservable = new JS.Module('FocusObservable', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** A map of supported focus event types. */
        EVENT_TYPES:{
            focus:true,
            blur:true
        },
        
        /** The common focus/blur event that gets reused. */
        EVENT:{source:null, type:null, value:null}
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.Node */
    initNode: function(parent, attrs) {
        this.focusable = false;
        this.focusEmbellishment = true;
        
        this.callSuper(parent, attrs);
    },
    
    /** @overrides myt.View */
    destroyBeforeOrphaning: function() {
        this.giveAwayFocus();
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setFocused: function(v) {
        if (this.focused !== v) {
            this.focused = v;
            if (this.inited) {
                this.fireEvent('focused', v);
                var gf = myt.global.focus;
                if (v) {
                    gf.notifyFocus(this);
                } else {
                    gf.notifyBlur(this);
                }
            }
        }
    },
    
    setFocusable: function(v) {
        var self = this;
        
        if (self.focusable !== v) {
            var wasFocusable = self.focusable;
            self.focusable = v;
            
            if (v) {
                self.getInnerDomElement().tabIndex = 0; // Make focusable. -1 is programtic only
                self.attachToDom(self, '__doFocus', 'focus');
                self.attachToDom(self, '__doBlur', 'blur');
            } else if (wasFocusable) {
                self.getInnerDomElement().removeAttribute('tabIndex'); // Make unfocusable
                self.detachFromDom(self, '__doFocus', 'focus');
                self.detachFromDom(self, '__doBlur', 'blur');
            }
            
            if (self.inited) self.fireEvent('focusable', v);
        }
    },
    
    setFocusEmbellishment: function(v) {
        if (this.focusEmbellishment !== v) {
            this.focusEmbellishment = v;
            if (this.focused) {
                if (v) {
                    this.showFocusEmbellishment();
                } else {
                    this.hideFocusEmbellishment();
                }
            }
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Gives the focus to the next focusable element or, if nothing else
        is focusable, blurs away from this element.
        @returns {undefined} */
    giveAwayFocus: function() {
        if (this.focused) {
            // Try to go to next focusable element.
            myt.global.focus.next();
            
            // If focus loops around to ourself make sure we don't keep it.
            if (this.focused) this.blur();
        }
    },
    
    /** Tests if this view is in a state where it can receive focus.
        @returns boolean True if this view is visible, enabled, focusable and
            not focus masked, false otherwise. */
    isFocusable: function() {
        return this.focusable && !this.disabled && this.isVisible() && 
            this.searchAncestorsOrSelf((n) => n.maskFocus === true) === null;
    },
    
    /** Calling this method will set focus onto this view if it is focusable.
        @param noScroll:boolean (optional) if true is provided no auto-scrolling
            will occur when focus is set.
        @returns {undefined} */
    focus: function(noScroll) {
        if (this.isFocusable()) this.getInnerDomElement().focus({preventScroll:noScroll});
    },
    
    /** Removes the focus from this view. Do not call this method directly.
        @private
        @returns {undefined} */
    blur: function() {
        this.getInnerDomElement().blur();
    },
    
    /** @private
        @param {!Object} event
        @returns {undefined} */
    __doFocus: function(event) {
        if (!this.focused) {
            this.setFocused(true);
            this.doFocus();
        }
    },
    
    /** @private
        @param {!Object} event
        @returns {undefined} */
    __doBlur: function(event) {
        if (this.focused) {
            this.doBlur();
            this.setFocused(false);
        }
    },
    
    /** @returns {undefined} */
    doFocus: function() {
        if (this.focusEmbellishment) {
            this.showFocusEmbellishment();
        } else {
            this.hideFocusEmbellishment();
        }
    },
    
    /** @returns {undefined} */
    doBlur: function() {
        if (this.focusEmbellishment) this.hideFocusEmbellishment();
    },
    
    /** @returns {undefined} */
    showFocusEmbellishment: function() {
        // IE
        this.getInnerDomElement().hideFocus = false;
        
        // Mozilla and Webkit
        var s = this.getInnerDomStyle();
        s.outlineWidth = 'thin';
        s.outlineColor = '#88bbff';
        s.outlineStyle = 'solid';
        s.outlineOffset = '0px';
    },
    
    /** @returns {undefined} */
    hideFocusEmbellishment: function() {
        this.hideDefaultFocusEmbellishment();
    },
    
    /** Hides the browser's default focus embellishment.
        @returns {undefined}*/
    hideDefaultFocusEmbellishment: function() {
        // IE
        this.getInnerDomElement().hideFocus = true;
        
        // Mozilla and Webkit
        this.getInnerDomStyle().outlineStyle = 'none';
    },
    
    /** @overrides myt.DomObservable */
    createDomMethodRef: function(domObserver, methodName, type) {
        if (myt.FocusObservable.EVENT_TYPES[type]) {
            var self = this;
            return (domEvent) => {
                if (!domEvent) domEvent = window.event;
                
                // OPTIMIZATION: prevent extra focus events under special 
                // circumstances. See myt.VariableLayout for more detail.
                if (self._ignoreFocus) {
                    domEvent.cancelBubble = true;
                    if (domEvent.stopPropagation) domEvent.stopPropagation();
                    domEvent.preventDefault();
                    return;
                }
                
                // Configure common focus event.
                var event = myt.FocusObservable.EVENT;
                event.source = self;
                event.type = domEvent.type;
                event.value = domEvent;
                
                var allowBubble = domObserver[methodName](event);
                if (!allowBubble) {
                    domEvent.cancelBubble = true;
                    if (domEvent.stopPropagation) domEvent.stopPropagation();
                }
                
                event.source = undefined;
            };
        }
        
        return this.callSuper(domObserver, methodName, type);
    }
});
