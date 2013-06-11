/** Tracks focus and provides global focus events. Registered with myt.global 
    as 'focus'.
    
    Events:
        focused:View Fired when the focused view changes. The event value is
            the newly focused view.
    
    Attributes:
        focusedView:View the view that currently has focus.
        prevFocusedView:View the view that previously had focus.
        _focusedDom:DomElement holds the dom element that has focus when the
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
    include: [myt.Observable],
    
    
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function() {
        myt.global.register('focus', this);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** Sets the currently focused view. */
    setFocusedView: function(v) {
        if (this.focusedView === v) return;
        this.prevFocusedView = this.focusedView; // Remember previous focus
        this.focusedView = v;
        if (v) this._focusedDom = null; // Wipe this since we have actual focus now.
        this.fireNewEvent('focused', v);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Called by a FocusObservable when it has received focus.
        @param focusable:FocusObservable the view that received focus.
        @returns void. */
    notifyFocus: function(focusable) {
        if (this.focusedView !== focusable) this.setFocusedView(focusable);
    },
    
    /** Called by a FocusObservable when it has lost focus.
        @param focusable:FocusObservable the view that lost focus.
        @returns void. */
    notifyBlur: function(focusable) {
        if (this.focusedView === focusable) this.setFocusedView(null);
    },
    
    /** Clears the current focus.
        @returns void */
    clear: function() {
        if (this.focusedView) {
            this.focusedView.blur();
        } else if (this._focusedDom) {
            this._focusedDom.blur();
            this._focusedDom = null;
        }
    },
    
    // Focus Traversal //
    /** Move focus to the next focusable element.
        @param ignoreFocusTrap:boolean If true focus traps will be skipped over.
        @returns void */
    next: function(ignoreFocusTrap) {
        var next = this._traverse(true, ignoreFocusTrap);
        if (next) next.focus();
    },
    
    /** Move focus to the previous focusable element.
        @param ignoreFocusTrap:boolean If true focus traps will be skipped over.
        @returns void */
    prev: function(ignoreFocusTrap) {
        var prev = this._traverse(false, ignoreFocusTrap);
        if (prev) prev.focus();
    },
    
    /** Travers forward or backward from the currently focused view.
        @param isForward:boolean indicates forward or backward dom traversal.
        @param ignoreFocusTrap:boolean indicates if focus traps should be
            skipped over or not.
        @returns the new view to give focus to, or null if there is no view
            to focus on or an unmanaged dom element will receive focus. */
    _traverse: function(isForward, ignoreFocusTrap) {
        // Get starting point for traversal
        var startElem, rootElem, focusTrap, f = this.focusedView;
        if (f) {
            startElem = f.domElement;
            focusTrap = ignoreFocusTrap === true ? null : f.getFocusTrap();
            rootElem = focusTrap ? focusTrap.domElement : document.body;
        } else {
            var fd = this._focusedDom;
            if (fd) {
                startElem = fd;
                
                // Get closest model for dom element
                var m = null;
                var fdModel;
                while (fd) {
                    fdModel = fd.model;
                    if (fdModel && fdModel instanceof myt.View) {
                        m = fdModel;
                        break;
                    }
                    fd = fd.parentNode;
                }
                
                if (m) {
                    focusTrap = ignoreFocusTrap === true ? null : m.getFocusTrap();
                    rootElem = focusTrap ? focusTrap.domElement : document.body;
                } else {
                    rootElem = document.body;
                }
            } else {
                startElem = rootElem = document.body;
            }
        }
        
        // Traverse
        var elem = startElem;
        var model, doTraversal, progElem;
        var focusFuncName = isForward ? 'getNextFocus' : 'getPrevFocus';
        
        while (elem) {
            // Use programtic focus traversal if the model supports it.
            doTraversal = true;
            if (elem.model && elem.model[focusFuncName]) {
                progElem = elem.model[focusFuncName]();
                if (progElem && progElem.domElement !== elem) {
                    elem = progElem.domElement;
                    doTraversal = false;
                }
            }
            
            if (doTraversal) {
                if (isForward) {
                    if (elem.firstChild) {
                        elem = elem.firstChild;
                    } else if (elem === rootElem) {
                        return startElem.model;
                    } else if (elem.nextSibling) {
                        elem = elem.nextSibling;
                    } else {
                        // Jump up and maybe over since we're at a local
                        // deepest last child.
                        while (elem) {
                            elem = elem.parentNode;
                            
                            if (elem === rootElem) {
                                break;
                            } else if (elem.nextSibling) {
                                elem = elem.nextSibling;
                                break;
                            }
                        }
                    }
                } else {
                    if (elem === rootElem) {
                        elem = this._getDeepestDescendant(rootElem);
                    } else if (elem.previousSibling) {
                        elem = this._getDeepestDescendant(elem.previousSibling);
                    } else {
                        elem = elem.parentNode;
                    }
                }
            }
            
            // If we've looped back around return the starting element.
            if (elem === startElem) return startElem.model;
            
            // Check that the element is focusable
            if (elem.nodeType === 1) {
                model = elem.model;
                if (model && model instanceof myt.View && model.isFocusable()) return model;
                
                var nodeName = elem.nodeName;
                if (nodeName === 'A' || nodeName === 'AREA') {
                    if (!isNaN(elem.tabIndex) && myt.DomElementProxy.isDomElementVisible(elem)) {
                        elem.focus();
                        this._focusedDom = elem;
                        return null;
                    }
                }
            }
        }
        
        return null;
    },
    
    /** Gets the deepest dom element that is a descendant of the provided
        dom element or the element itself.
        @param elem:domElement The dom element to search downward from.
        @returns a dom element. */
    _getDeepestDescendant: function(elem) {
        while (elem) {
            if (elem.lastChild) {
                elem = elem.lastChild;
            } else {
                return elem;
            }
        }
    }
});
