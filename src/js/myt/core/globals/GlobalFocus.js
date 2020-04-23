((pkg) => {
    var globalFocus,
        
        /** Gets the deepest dom element that is a descendant of the provided
            dom element or the element itself. */
        getDeepestDescendant = (elem) => {
            while (elem.lastChild) elem = elem.lastChild;
            return elem;
        },
        
        /** Traverse forward or backward from the currently focused view. 
            Returns the new view to give focus to, or null if there is no view
            to focus on or an unmanaged dom element will receive focus.
                param: isForward:boolean indicates forward or backward dom 
                    traversal.
                param: ignoreFocusTrap:boolean indicates if focus traps should 
                    be skipped over or not. */
        traverse = (isForward, ignoreFocusTrap) => {
            globalFocus.lastTraversalWasForward = isForward;
            
            // Determine root element and starting element for traversal.
            var activeElem = document.activeElement, 
                rootElem = document.body,
                startElem = rootElem,
                elem = startElem,
                model, progModel,
                focusFuncName = isForward ? 'getNextFocus' : 'getPrevFocus';
            
            if (activeElem) {
                elem = startElem = activeElem;
                model = startElem.model;
                if (!model) model = globalFocus.findModelForDomElement(startElem);
                if (model) {
                    var focusTrap = model.getFocusTrap(ignoreFocusTrap);
                    if (focusTrap) rootElem = focusTrap.domElement;
                }
            }
            
            // Traverse
            while (elem) {
                if (elem.model && elem.model[focusFuncName] &&
                    (progModel = elem.model[focusFuncName]())
                ) {
                    // Programatic traverse
                    elem = progModel.domElement;
                } else if (isForward) {
                    // Dom traverse forward
                    if (elem.firstChild) {
                        elem = elem.firstChild;
                    } else if (elem === rootElem) {
                        return startElem.model; // TODO: why?
                    } else if (elem.nextSibling) {
                        elem = elem.nextSibling;
                    } else {
                        // Jump up and maybe over since we're at a local
                        // deepest last child.
                        while (elem) {
                            elem = elem.parentNode;
                            
                            if (elem === rootElem) {
                                break; // TODO: why?
                            } else if (elem.nextSibling) {
                                elem = elem.nextSibling;
                                break;
                            }
                        }
                    }
                } else {
                    // Dom traverse backward
                    if (elem === rootElem) {
                        elem = getDeepestDescendant(rootElem);
                    } else if (elem.previousSibling) {
                        elem = getDeepestDescendant(elem.previousSibling);
                    } else {
                        elem = elem.parentNode;
                    }
                }
                
                // If we've looped back around return the starting element.
                if (elem === startElem) return startElem.model;
                
                // Check that the element is focusable and return it if it is.
                if (elem.nodeType === 1) {
                    model = elem.model;
                    if (model && model instanceof pkg.View) {
                        if (model.isFocusable()) return model;
                    } else {
                        var nodeName = elem.nodeName;
                        if (nodeName === 'A' || nodeName === 'AREA' || 
                            nodeName === 'INPUT' || nodeName === 'TEXTAREA' || 
                            nodeName === 'SELECT' || nodeName === 'BUTTON'
                        ) {
                            if (!elem.disabled && !isNaN(elem.tabIndex) && 
                                pkg.DomElementProxy.isDomElementVisible(elem)
                            ) {
                                // Make sure the dom element isn't inside a maskFocus
                                model = globalFocus.findModelForDomElement(elem);
                                if (model && model.searchAncestorsOrSelf((n) => n.maskFocus === true)) {
                                    // Is a masked dom element so ignore.
                                } else {
                                    elem.focus();
                                    globalFocus.focusedDom = elem;
                                    return null;
                                }
                            }
                        }
                    }
                }
            }
            
            return null;
        };
    
    /** Tracks focus and provides global focus events. Registered with myt.global 
        as 'focus'.
        
        Events:
            focused:View Fired when the focused view changes. The event value is
                the newly focused view.
        
        Attributes:
            lastTraversalWasForward:boolean indicates if the last traversal was
                in the forward direction or not. If false this implies the last
                traversal was in the backward direction. This value is initalized
                to true.
            focusedView:View the view that currently has focus.
            prevFocusedView:View the view that previously had focus.
            focusedDom:DomElement holds the dom element that has focus when the
                focus has traversed into a non myt managed area of the dom.
    */
    /* Dom element types reference:
        ELEMENT_NODE                :1
        ATTRIBUTE_NODE              :2
        TEXT_NODE                   :3
        CDATA_SECTION_NODE          :4
        ENTITY_REFERENCE_NODE       :5
        ENTITY_NODE                 :6
        PROCESSING_INSTRUCTION_NODE :7
        COMMENT_NODE                :8
        DOCUMENT_NODE               :9
        DOCUMENT_TYPE_NODE          :10
        DOCUMENT_FRAGMENT_NODE      :11
        NOTATION_NODE               :12 */
    new JS.Singleton('GlobalFocus', {
        include: [pkg.Observable],
        
        
        // Constructor /////////////////////////////////////////////////////////
        initialize: function() {
            this.lastTraversalWasForward = true;
            
            pkg.global.register('focus', globalFocus = this);
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** Sets the currently focused view. */
        setFocusedView: (v) => {
            if (globalFocus.focusedView !== v) {
                globalFocus.prevFocusedView = globalFocus.focusedView; // Remember previous focus
                globalFocus.focusedView = v;
                if (v) globalFocus.focusedDom = null; // Wipe this since we have actual focus now.
                globalFocus.fireEvent('focused', v);
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Called by a FocusObservable when it has received focus.
            @param focusable:FocusObservable the view that received focus.
            @returns {undefined}. */
        notifyFocus: (focusable) => {
            if (globalFocus.focusedView !== focusable) globalFocus.setFocusedView(focusable);
        },
        
        /** Called by a FocusObservable when it has lost focus.
            @param focusable:FocusObservable the view that lost focus.
            @returns {undefined}. */
        notifyBlur: (focusable) => {
            if (globalFocus.focusedView === focusable) globalFocus.setFocusedView(null);
        },
        
        /** Clears the current focus.
            @returns {undefined} */
        clear: () => {
            if (globalFocus.focusedView) {
                globalFocus.focusedView.blur();
            } else if (globalFocus.focusedDom) {
                globalFocus.focusedDom.blur();
                globalFocus.focusedDom = null;
            }
        },
        
        // Focus Traversal //
        /** Move focus to the next focusable element.
            @param ignoreFocusTrap:boolean If true focus traps will be skipped over.
            @returns {undefined} */
        next: (ignoreFocusTrap) => {
            var next = traverse(true, ignoreFocusTrap);
            if (next) next.focus();
        },
        
        /** Move focus to the previous focusable element.
            @param ignoreFocusTrap:boolean If true focus traps will be skipped over.
            @returns {undefined} */
        prev: (ignoreFocusTrap) => {
            var prev = traverse(false, ignoreFocusTrap);
            if (prev) prev.focus();
        },
        
        /** Finds the closest model for the provided dom element.
            @param elem:domElement to element to start looking from.
            @returns myt.View or null if not found. */
        findModelForDomElement: (elem) => {
            var model;
            while (elem) {
                model = elem.model;
                if (model && model instanceof pkg.View) return model;
                elem = elem.parentNode;
            }
            return null;
        }
    });
})(myt);
