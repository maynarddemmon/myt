(pkg => {
    const JSClass = JS.Class,
        
        {View, SizeToDom} = pkg;
    
    /** A base class for flexbox views.
        
        @class */
    pkg.Flexbox = new JSClass('Flexbox', View, {
        include: [pkg.FlexboxSupport]
    });
    
    /** A view for an iframe. This component also listens to global mousedown and mouseup events 
        and turns off point-events so that the iframe will interfere less with mouse behavior in 
        the parent document.
        
        Events:
            src:string
        
        Attributes:
            src:string The URL to an HTML document to load into the iframe.
        
        Private Attributes:
            __restorePointerEvents:string The value of pointerEvents before a mousedown occurs. 
                Used as part of turning off pointer-events so that the iframe messes less with 
                mouse behavior in the parent document.
        
        @class */
    pkg.Frame = new JSClass('Frame', View, {
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.View */
        initNode: function(parent, attrs) {
            attrs.tagName ??= 'iframe';
            
            this.callSuper(parent, attrs);
            
            const GlobalMouse = pkg.global.mouse;
            this.attachToDom(GlobalMouse, '__doMouseDown', 'mousedown', true);
            this.attachToDom(GlobalMouse, '__doMouseUp', 'mouseup', true);
        },
        
        /** @overrides myt.View */
        createOurDomElement: function(parent) {
            const elements = this.callSuper(parent),
                innerElem = Array.isArray(elements) ? elements[1] : elements;
            innerElem.style.border = '0px';
            return elements;
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setSrc: function(v) {
            if (this.src !== v) {
                this.src = this.getIDE().src = v;
                if (this.inited) this.fireEvent('src', v);
            }
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __doMouseDown: function(event) {
            this.__restorePointerEvents = this.pointerEvents;
            this.setPointerEvents('none');
            return true;
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __doMouseUp: function(event) {
            this.setPointerEvents(this.__restorePointerEvents);
            return true;
        }
    });
    
    /** Displays HTML markup and resizes the view to fit the markup.
        
        Attributes:
            html:string The HTML to insert into the view.
        
        @class */
    pkg.Markup = new JSClass('Markup', View, {
        include: [SizeToDom],
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setHtml: function(v) {
            const self = this;
            if (self.html !== v) {
                self.getIDE().innerHTML = self.html = v;
                if (self.inited) {
                    self.fireEvent('html', v);
                    self.sizeViewToDom();
                }
            }
        }
    });
    
    /** Displays text content.
        
        @class */
    pkg.Text = new JSClass('Text', View, {
        include: [SizeToDom, pkg.TextSupport],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.View */
        initNode: function(parent, attrs) {
            attrs.whiteSpace ??= 'nowrap';
            attrs.userUnselectable ??= true;
            
            this.callSuper(parent, attrs);
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Measures the width of this element as if the wrapping was set to 'nowrap'. The dom 
            element is manipulated directly so that no events get fired.
            @returns number the unwrapped width of this text view. */
        measureNoWrapWidth: function() {
            const self = this,
                hasSetWidth = self.__hasSetWidth,
                oldWidth = self.width;
            
            if (!hasSetWidth && self.whiteSpace === 'nowrap') return oldWidth;
            
            // Temporarily set wrapping to 'nowrap', take measurement and then restore wrapping.
            const ids = self.getIDS(),
                oldValue = ids.whiteSpace;
            if (hasSetWidth) ids.width = 'auto';
            ids.whiteSpace = 'nowrap';
            const measuredWidth = self.getODE().getBoundingClientRect().width; // Use getBoundingClientRect to support fractional widths
            ids.whiteSpace = oldValue;
            if (hasSetWidth) ids.width = oldWidth;
            return measuredWidth;
        }
    });
    
    /** Displays padded text content.
        
        @class */
    pkg.PaddedText = new JSClass('PaddedText', pkg.Text, {
        include: [pkg.PaddedTextSupport]
    });
    
    /** A view that displays an image. By default useNaturalSize is set to true so the Image will 
        take on the size of the image data.
        
        @class */
    pkg.Image = new JSClass('Image', View, {
        include: [pkg.ImageSupport],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.View */
        initNode: function(parent, attrs) {
            attrs.useNaturalSize ??= true;
            
            this.callSuper(parent, attrs);
        }
    });
    
    /** A view that keeps the first subview added to it always in the back. Subclasses such as 
        Canvas and Annulus will make use of this feature to allow the appearance of subview 
        support for HTML elements that ordinarily do not allow sub elements.
        
        @class */
    pkg.BackView = new JSClass('BackView', View, {
        /** @overrides
            Prevent views from being sent behind the first subview added to this view. This allows 
            us to add child views that will always stay in front. */
        sendSubviewToBack: function(sv) {
            if (sv.parent === this) {
                const ide = this.getIDE(),
                    firstChild = ide.childNodes[1],
                    svOde = sv.getODE();
                if (svOde !== firstChild) {
                    const removedElem = ide.removeChild(svOde);
                    if (removedElem) ide.insertBefore(removedElem, firstChild);
                }
            }
        }
    });
})(myt);
