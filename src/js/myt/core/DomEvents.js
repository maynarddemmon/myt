(pkg => {
    const JSModule = JS.Module,
        
        GlobalFocus = pkg.global.focus,
        
        makeEmptyEvent = () => {
            return {source:null, type:null, value:null};
        },
        
        /** Generates Key Events and passes them on to one or more event 
            observers. Requires myt.DomObservable as a super mixin.
            
            @class */
        KeyObservable = pkg.KeyObservable = new JSModule('KeyObservable', {
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                /** A map of supported key event types. */
                EVENT_TYPES: {
                    keypress:true,
                    keydown:true,
                    keyup:true
                },
                
                /** The common key event that gets reused. */
                EVENT: makeEmptyEvent(),
                
                /** Gets the key code from the provided key event.
                    @param {!Object} event Event value is a dom event.
                    @returns {number} The keycode from the event. */
                getKeyCodeFromEvent: event => event.value.keyCode || event.value.charCode
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.DomObservable */
            createDomHandler: function(domObserver, methodName, type) {
                return this.createStandardDomHandler(domObserver, methodName, type, KeyObservable) || 
                    this.callSuper(domObserver, methodName, type);
            }
        }),
        
        /** Generates Mouse Events and passes them on to one or more event 
            observers. Also provides the capability to capture contextmenu 
            events and mouse wheel events.
            
            Requires: myt.DomObservable super mixin.
            
            @class */
        MouseObservable = pkg.MouseObservable = new JSModule('MouseObservable', {
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                /** A map of supported mouse event types. */
                EVENT_TYPES: {
                    mouseover:true,
                    mouseout:true,
                    mousedown:true,
                    mouseup:true,
                    click:true,
                    dblclick:true,
                    mousemove:true,
                    contextmenu:true,
                    wheel:true
                },
                
                /** The common mouse event that gets reused. */
                EVENT: makeEmptyEvent(),
                
                /** Gets the mouse coordinates from the provided event.
                    @param {!Object} event Event value is a dom event.
                    @returns {!Object} An object with 'x' and 'y' keys 
                        containing the x and y mouse position. */
                getMouseFromEvent: event => {
                    return {x:event.value.pageX, y:event.value.pageY};
                },
                
                getMouseFromEventRelativeToView: (event, view) => {
                    const viewPos = view.getPagePosition(),
                        pos = MouseObservable.getMouseFromEvent(event);
                    pos.x -= viewPos.x;
                    pos.y -= viewPos.y;
                    return pos;
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.DomObservable */
            createDomHandler: function(domObserver, methodName, type) {
                return this.createStandardDomHandler(domObserver, methodName, type, MouseObservable, true) || 
                    this.callSuper(domObserver, methodName, type);
            }
        }),
        
        /** Generates Scroll Events and passes them on to one or more 
            event observers.
            
            Requires myt.DomObservable as a super mixin.
            
            @class */
        ScrollObservable = pkg.ScrollObservable = new JSModule('ScrollObservable', {
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                /** A map of supported scroll event types. */
                EVENT_TYPES: {
                    scroll:true
                },
                
                /** The common scroll event that gets reused. */
                EVENT: makeEmptyEvent(),
                
                /** Gets the scrollLeft and scrollTop from the event.
                    @param {!Object} event Event value is a dom event.
                    @returns object with an x and y key each containing 
                        a number. */
                getScrollFromEvent: event => {
                    const value = event.value,
                        target = value.target || value.srcElement;
                    return {x:target.scrollLeft, y:target.scrollTop};
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.DomObservable */
            createDomHandler: function(domObserver, methodName, type) {
                return this.createStandardDomHandler(domObserver, methodName, type, ScrollObservable) || 
                    this.callSuper(domObserver, methodName, type);
            }
        }),
        
        /** Generates Touch Events and passes them on to one or more 
            event observers.
            
            Requires: myt.DomObservable super mixin.
            
            @class */
        TouchObservable = pkg.TouchObservable = new JSModule('TouchObservable', {
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                /** A map of supported touch event types. */
                EVENT_TYPES: {
                    touchstart:true,
                    touchend:true,
                    touchmove:true,
                    touchcancel:true
                },
                
                /** The common touch event that gets reused. */
                EVENT: makeEmptyEvent()
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.DomObservable */
            createDomHandler: function(domObserver, methodName, type) {
                return this.createStandardDomHandler(domObserver, methodName, type, TouchObservable, false) || 
                    this.callSuper(domObserver, methodName, type);
            }
        }),
        
        /** Generates focus and blur events and passes them on to one or more 
            event observers. Also provides focus related events to a view. 
            When a view is focused or blurred, myt.global.focus will be 
            notified via the 'notifyFocus' and 'notifyBlur' methods.
            
            Requires myt.DomObservable as a super mixin.
            
            Events:
                focused:object Fired when this view gets focus. The value is 
                    this view.
                focus:object Fired when this view gets focus. The value is 
                    a dom focus event.
                blur:object Fired when this view loses focus. The value is 
                    a dom focus event.
            
            Attributes:
                focused:boolean Indicates if this view has focus or not.
                focusable:boolean Indicates if this view can have focus or not.
                focusIndicator:boolean Indicates if the focus indicator should
                    be shown for this view or not when it has focus.
            
            Virtual Methods:
                getNextFocus() Implement this method to return the next view 
                    that should have focus. If null is returned or the method 
                    is not implemented, normal dom traversal will occur.
                getPrevFocus() Implement this method to return the prev view 
                    that should have focus. If null is returned or the method 
                    is not implemented, normal dom traversal will occur.
            
            @class */
        // TODO: fire focus and blur events rather than a focused event?
        // FIXME: should we give away focus when we become not visible?
        FocusObservable = pkg.FocusObservable = new JSModule('FocusObservable', {
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                /** A map of supported focus event types. */
                EVENT_TYPES: {
                    focus:true,
                    blur:true
                },
                
                /** The common focus/blur event that gets reused. */
                EVENT: makeEmptyEvent()
            },
            
            
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides myt.Node */
            initNode: function(parent, attrs) {
                this.focusable = false;
                this.focusIndicator = true;
                
                this.callSuper(parent, attrs);
            },
            
            /** @overrides myt.View */
            destroy: function() {
                this.giveAwayFocus();
                this.callSuper();
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setFocused: function(v) {
                if (this.focused !== v) {
                    this.focused = v;
                    if (this.inited) {
                        this.fireEvent('focused', v);
                        if (v) {
                            GlobalFocus.notifyFocus(this);
                        } else {
                            GlobalFocus.notifyBlur(this);
                        }
                    }
                }
            },
            
            setFocusable: function(v) {
                const self = this;
                if (self.focusable !== v) {
                    const wasFocusable = self.focusable;
                    self.focusable = v;
                    
                    if (v) {
                        self.getIDE().tabIndex = 0; // Make focusable. -1 is programmatic only
                        self.attachToDom(self, '__doFocus', 'focus');
                        self.attachToDom(self, '__doBlur', 'blur');
                    } else if (wasFocusable) {
                        self.getIDE().removeAttribute('tabIndex'); // Make unfocusable
                        self.detachFromDom(self, '__doFocus', 'focus');
                        self.detachFromDom(self, '__doBlur', 'blur');
                    }
                    
                    if (self.inited) self.fireEvent('focusable', v);
                }
            },
            
            setFocusIndicator: function(v) {
                if (this.focusIndicator !== v) {
                    this.focusIndicator = v;
                    if (this.focused) {
                        if (v) {
                            this.showFocusIndicator();
                        } else {
                            this.hideFocusIndicator();
                        }
                    }
                }
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Gives the focus to the next focusable element or, if nothing 
                else is focusable, blurs away from this element.
                @returns {undefined} */
            giveAwayFocus: function() {
                if (this.focused) {
                    // Try to go to next focusable element.
                    GlobalFocus.next();
                    
                    // If focus loops around to ourself make sure we 
                    // do not keep it.
                    if (this.focused) this.blur();
                }
            },
            
            /** Tests if this view is in a state where it can receive focus.
                @returns boolean True if this view is visible, enabled, 
                    focusable and not focus masked, false otherwise. */
            isFocusable: function() {
                return this.focusable && !this.disabled && this.isVisible() && 
                    this.searchAncestorsOrSelf(node => node.maskFocus === true) == null;
            },
            
            /** Calling this method will set focus onto this view if it 
                is focusable.
                @param noScroll:boolean (optional) if true is provided no 
                    auto-scrolling will occur when focus is set.
                @returns {undefined} */
            focus: function(noScroll) {
                if (this.isFocusable()) this.getIDE().focus({preventScroll:noScroll});
            },
            
            /** Removes the focus from this view. Do not call this 
                method directly.
                @private
                @returns {undefined} */
            blur: function() {
                this.getIDE().blur();
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
                if (this.focusIndicator) {
                    this.showFocusIndicator();
                } else {
                    this.hideFocusIndicator();
                }
            },
            
            /** @returns {undefined} */
            doBlur: function() {
                if (this.focusIndicator) this.hideFocusIndicator();
            },
            
            /** @returns {undefined} */
            showFocusIndicator: function() {
                // IE
                this.getIDE().hideFocus = false;
                
                // Mozilla and Webkit
                const ids = this.getIDS();
                ids.outlineWidth = 'thin';
                ids.outlineColor = '#8bf';
                ids.outlineStyle = 'solid';
                ids.outlineOffset = '0px';
            },
            
            /** @returns {undefined} */
            hideFocusIndicator: function() {
                this.hideDefaultFocusIndicator();
            },
            
            /** Hides the browser's default focus indicator.
                @returns {undefined}*/
            hideDefaultFocusIndicator: function() {
                // IE
                this.getIDE().hideFocus = true;
                
                // Mozilla and Webkit
                this.getIDS().outlineStyle = 'none';
            },
            
            /** @overrides myt.DomObservable */
            createDomHandler: function(domObserver, methodName, type) {
                if (FocusObservable.EVENT_TYPES[type]) {
                    const self = this;
                    return domEvent => {
                        if (!domEvent) domEvent = window.event;
                        
                        // OPTIMIZATION: prevent extra focus events under 
                        // special circumstances. See myt.VariableLayout 
                        // for more detail.
                        if (self._ignoreFocus) {
                            domEvent.cancelBubble = true;
                            if (domEvent.stopPropagation) domEvent.stopPropagation();
                            domEvent.preventDefault();
                            return;
                        }
                        
                        // Configure common focus event.
                        const event = FocusObservable.EVENT;
                        event.source = self;
                        event.type = domEvent.type;
                        event.value = domEvent;
                        
                        const allowBubble = domObserver[methodName](event);
                        if (!allowBubble) {
                            domEvent.cancelBubble = true;
                            if (domEvent.stopPropagation) domEvent.stopPropagation();
                        }
                        
                        event.source = undefined;
                    };
                }
                
                return this.callSuper(domObserver, methodName, type);
            }
        }),
        
        /** Generates input events and passes them on to one or more 
            event observers.
            
            Requires myt.DomObservable as a super mixin.
            
            @class */
        InputObservable = pkg.InputObservable = new JSModule('InputObservable', {
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                /** A map of supported input event types. */
                EVENT_TYPES: {
                    input:true,
                    select:true,
                    change:true,
                    paste:true
                },
                
                /** The common change/select event that gets reused. */
                EVENT: makeEmptyEvent()
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.DomObservable */
            createDomHandler: function(domObserver, methodName, type) {
                return this.createStandardDomHandler(domObserver, methodName, type, InputObservable) || 
                    this.callSuper(domObserver, methodName, type);
            }
        }),
        
        /** Generates drag and drop events and passes them on to one or more 
            event observers.
            
            Requires myt.DomObservable as a super mixin.
            
            @class */
        DragDropObservable = pkg.DragDropObservable = new JSModule('DragDropObservable', {
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                /** A map of supported drag and drop event types. */
                EVENT_TYPES: {
                    dragleave:true,
                    dragenter:true,
                    dragover:true,
                    drop:true
                },
                
                /** The common drag and drop event that gets reused. */
                EVENT: makeEmptyEvent()
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** @overrides myt.DomObservable */
            createDomHandler: function(domObserver, methodName, type) {
                return this.createStandardDomHandler(domObserver, methodName, type, DragDropObservable, true) || 
                    this.callSuper(domObserver, methodName, type);
            }
        });
    
    /** Generates Dom Events and passes them on to one or more event observers.
        Requires myt.DomElementProxy be included when this mixin is included.
        
        Private Attributes:
            __dobsbt:object Stores arrays of myt.DomObservers and method 
                names by event type.
        
        @class */
    pkg.DomObservable = new JSModule('DomObservable', {
        // Methods /////////////////////////////////////////////////////////////
        /** Adds the observer to the list of event recipients for the 
            event type.
            @param {!Object} domObserver - The myt.DomObserver that will be 
                notified when a dom event occurs.
            @param {string} methodName - The method name to call on the 
                dom observer.
            @param {string} type - The type of dom event to register for.
            @param {boolean} [capture] - Indicates if the event registration 
                is during capture or bubble phase. Defaults to false, 
                bubble phase.
            @param {boolean} [passive]
            @returns {boolean} - True if the observer was successfully 
                registered, false otherwise. */
        attachDomObserver: function(domObserver, methodName, type, capture, passive) {
            if (domObserver && methodName && type) {
                capture = !!capture;
                
                const methodRef = this.createDomHandler(domObserver, methodName, type);
                if (methodRef) {
                    const domObserversByType = this.__dobsbt || (this.__dobsbt = {});
                    
                    // Lazy instantiate dom observers array for type and 
                    // insert observer.
                    const domObservers = domObserversByType[type];
                    if (!domObservers) {
                        // Create list with observer
                        domObserversByType[type] = [domObserver, methodName, methodRef, capture];
                    } else {
                        // Add dom observer to the end of the list
                        domObservers.push(domObserver, methodName, methodRef, capture);
                    }
                    
                    pkg.addEventListener(this.getDomElementForDomObservable(type), type, methodRef, capture, passive);
                    
                    return true;
                }
            }
            return false;
        },
        
        getDomElementForDomObservable: function(type) {
            return this.getIDE();
        },
        
        /** Creates a function that will handle the dom event when it is fired
            by the browser. Must be implemented by the object this mixin is 
            applied to.
            @param {!Object} domObserver - The myt.DomObserver that must be 
                notified when the dom event fires.
            @param {string} methodName - the name of the function to pass the 
                event to.
            @param {string} type - the type of the event to fire.
            @returns {?Function} - A function to handle the dom event or null 
                if the event is not supported. */
        createDomHandler: (domObserver, methodName, type) => null,
        
        /** Used by the createDomHandler implementations of submixins of 
            myt.DomObservable to implement the standard methodRef.
            @param {!Object} domObserver - The myt.DomObserver that must be 
                notified when the dom event fires.
            @param {string} methodName - The name of the function to pass the 
                event to.
            @param {string} type - The type of the event to fire.
            @param {!Function} observableClass - The JS.Class that has the 
                common event.
            @param {boolean} [preventDefault] - If true the default behavior
                of the domEvent will be prevented.
            @returns {?Function} - A function to handle the dom event or 
                undefined if the event will not be handled. */
        createStandardDomHandler: function(domObserver, methodName, type, observableClass, preventDefault) {
            if (observableClass.EVENT_TYPES[type]) {
                const self = this, 
                    event = observableClass.EVENT;
                return domEvent => {
                    if (!domEvent) domEvent = window.event;
                    
                    event.source = self;
                    event.type = domEvent.type;
                    event.value = domEvent;
                    
                    // Execute handler function and prevent event bubbling if
                    // the handler returned false.
                    if (!domObserver[methodName](event)) {
                        domEvent.cancelBubble = true;
                        if (domEvent.stopPropagation) domEvent.stopPropagation();
                        if (preventDefault) domEvent.preventDefault();
                    }
                    
                    event.source = undefined;
                };
            }
        },
        
        /** Removes the observer from the list of dom observers for the 
            event type.
            @param {!Object} domObserver - The myt.DomObserver to unregister.
            @param {string} methodName - The method name to unregister for.
            @param {string} type - The dom event type to unregister for.
            @param {boolean} [capture] - The event phase to unregister for.
                Defaults to false if not provided.
            @returns {boolean} - True if the observer was successfully 
                unregistered, false otherwise.*/
        detachDomObserver: function(domObserver, methodName, type, capture) {
            if (domObserver && methodName && type) {
                capture = !!capture;
                
                const domObserversByType = this.__dobsbt;
                if (domObserversByType) {
                    const domObservers = domObserversByType[type];
                    if (domObservers) {
                        // Remove dom observer
                        const de = this.getDomElementForDomObservable(type);
                        let retval = false,  
                            i = domObservers.length;
                        while (i) {
                            i -= 4;
                            if (domObserver === domObservers[i] && 
                                methodName === domObservers[i + 1] && 
                                capture === domObservers[i + 3]
                            ) {
                                if (de) pkg.removeEventListener(de, type, domObservers[i + 2], capture);
                                domObservers.splice(i, 4);
                                retval = true;
                            }
                        }
                        return retval;
                    }
                }
            }
            return false;
        },
        
        /** Detaches all dom observers from this DomObservable.
            @returns {undefined} */
        detachAllDomObservers: function() {
            const domObserversByType = this.__dobsbt;
            if (domObserversByType) {
                for (const type in domObserversByType) {
                    const domObservers = domObserversByType[type];
                    let i = domObservers.length;
                    while (i) {
                        const capture = domObservers[--i],
                            methodRef = domObservers[--i];
                        i -= 2; // methodName and domObserver
                        pkg.removeEventListener(this.getDomElementForDomObservable(type), type, methodRef, capture);
                    }
                    domObservers.length = 0;
                }
            }
        }
    });
    
    /** Provides a mechanism to remember which DomObservables this 
        DomObserver has attached itself to. This is useful when the 
        instance is being destroyed to automatically cleanup the 
        observer/observable relationships.
        
        When this mixin is used attachment and detachment should be done 
        using the 'attachToDom' and 'detachFromDom' methods of this mixin. 
        If this is not done, it is possible for the relationship between 
        observer and observable to become broken.
        
        Private Attributes:
            __dobt: (Object) Holds arrays of DomObservables by event type.
        
        @class */
    pkg.DomObserver = new JSModule('DomObserver', {
        // Methods /////////////////////////////////////////////////////////////
        /** Attaches this DomObserver to the provided DomObservable for the 
            provided type.
            @param {!Object} observable
            @param {string} methodName
            @param {string} type
            @param {boolean} [capture]
            @param {boolean} [passive]
            @returns {undefined} */
        attachToDom: function(observable, methodName, type, capture, passive) {
            if (observable && methodName && type) {
                capture = !!capture;
                
                // Lazy instantiate __dobt map.
                const observablesByType = this.__dobt || (this.__dobt = {}),
                    observables = observablesByType[type] || (observablesByType[type] = []);
                
                // Attach this DomObserver to the DomObservable
                if (observable.attachDomObserver(this, methodName, type, capture, passive)) {
                    observables.push(capture, methodName, observable);
                }
            }
        },
        
        /** Detaches this DomObserver from the DomObservable for the 
            event type.
            @param {!Object} observable
            @param {string} methodName
            @param {string} type
            @param {boolean} [capture]
            @returns {boolean} - True if detachment succeeded, 
                false otherwise. */
        detachFromDom: function(observable, methodName, type, capture) {
            if (observable && methodName && type) {
                capture = !!capture;
                
                // No need to detach if observable array doesn't exist.
                const observablesByType = this.__dobt;
                if (observablesByType) {
                    const observables = observablesByType[type];
                    if (observables) {
                        // Remove all instances of this observer/methodName/type/capture 
                        // from the observable
                        let retval = false, 
                            i = observables.length;
                        while (i) {
                            i -= 3;
                            if (observable === observables[i + 2] && 
                                methodName === observables[i + 1] && 
                                capture === observables[i]
                            ) {
                                if (observable.detachDomObserver(this, methodName, type, capture)) {
                                    observables.splice(i, 3);
                                    retval = true;
                                }
                            }
                        }
                        
                        // Observable was not found
                        return retval;
                    }
                }
            }
            return false;
        },
        
        /** Detaches this DomObserver from all DomObservables it is attached to.
            @returns {undefined} */
        detachFromAllDomSources: function() {
            const observablesByType = this.__dobt;
            if (observablesByType) {
                for (const type in observablesByType) {
                    const observables = observablesByType[type];
                    let i = observables.length;
                    while (i) observables[--i].detachDomObserver(this, observables[--i], type, observables[--i]);
                    observables.length = 0;
                }
            }
        }
    });
})(myt);
