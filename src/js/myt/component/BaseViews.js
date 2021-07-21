((pkg) => {
    const JSClass = JS.Class,
        View = pkg.View,
        SizeToDom = pkg.SizeToDom;
    
    /** A base class for flex box views.
        
        @class */
    pkg.FlexBox = new JSClass('FlexBox', View, {
        include: [pkg.FlexBoxSupport]
    });
    
    /** A view for an iframe. This component also listens to global mousedown/up
        events and turns off point-events so that the iframe will interfere
        less with mouse behavior in the parent document.
        
        Events:
            src:string
        
        Attributes:
            src:string The URL to an HTML document to load into the iframe.
        
        Private Attributes:
            __restorePointerEvents:string The value of pointerEvents before a
                mousedown occurs. Used as part of turning off pointer-events
                so that the iframe messes less with mouse behavior in the 
                parent document.
        
        @class */
    pkg.Frame = new JSClass('Frame', View, {
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.View */
        initNode: function(parent, attrs) {
            if (attrs.tagName == null) attrs.tagName = 'iframe';
            
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
                this.src = this.getInnerDomElement().src = v;
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
                self.getInnerDomElement().innerHTML = self.html = v;
                if (self.inited) {
                    self.fireEvent('html', v);
                    self.sizeViewToDom();
                }
            }
        }
    });

    /** Displays text content.
        
        Performance Note: If you set the bgColor of a text element it will 
        render about 10% faster than if the background is set to 'transparent'.
        
        @class */
    pkg.Text = new JSClass('Text', View, {
        include: [SizeToDom, pkg.TextSupport],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.View */
        initNode: function(parent, attrs) {
            if (attrs.whiteSpace == null) attrs.whiteSpace = 'nowrap';
            if (attrs.userUnselectable == null) attrs.userUnselectable = true;
            
            this.callSuper(parent, attrs);
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Measures the width of this element as if the wrapping was set 
            to 'nowrap'. The dom element is manipulated directly so that no 
            events get fired.
            @returns number the unwrapped width of this text view. */
        measureNoWrapWidth: function() {
            if (this.whiteSpace === 'nowrap') return this.width;
            
            // Temporarily set wrapping to 'nowrap', take measurement and
            // then restore wrapping.
            const ids = this.getInnerDomStyle(),
                oldValue = ids.whiteSpace;
            ids.whiteSpace = 'nowrap';
            const measuredWidth = this.getOuterDomElement().offsetWidth;
            ids.whiteSpace = oldValue;
            return measuredWidth;
        }
    });
    
    /** A view that displays an image. By default useNaturalSize is set to true
        so the Image will take on the size of the image data.
        
        @class */
    pkg.Image = new JSClass('Image', View, {
        include: [pkg.ImageSupport],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.View */
        initNode: function(parent, attrs) {
            if (attrs.useNaturalSize == null) attrs.useNaturalSize = true;
            
            this.callSuper(parent, attrs);
        }
    });
})(myt);
