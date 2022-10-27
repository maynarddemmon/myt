(pkg => {
    const JSModule = JS.Module,
        
        setWidth = (view, value) => {
            if (value === 'auto') {
                view.__hasSetWidth = false;
                view.getODS().width = 'auto';
                view.sizeViewToDom();
            } else {
                view.__hasSetWidth = true;
                return true; // Tells callee to callSuper
            }
        },
        
        setHeight = (view, value) => {
            if (value === 'auto') {
                view.__hasSetHeight = false;
                view.getODS().height = 'auto';
                view.sizeViewToDom();
            } else {
                view.__hasSetHeight = true;
                return true; // Tells callee to callSuper
            }
        },
        
        sizeWidth = view => {
            if (!view.__hasSetWidth) {
                // Bounding rect doesn't factor in scaling so we need to 
                // calculate this ourselves.
                const w = view.getODE().offsetWidth / view.getEffectiveScaleX();
                
                // Circumvent setter
                if (view.width !== w) {
                    view.width = w;
                    if (view.inited) view.__updateBounds(w, view.height);
                    view.fireEvent('width', w);
                }
            }
        },
        
        sizeHeight = view => {
            if (!view.__hasSetHeight) {
                // Bounding rect doesn't factor in scaling so we need to 
                // calculate this ourselves.
                const h = view.getODE().offsetHeight / view.getEffectiveScaleY();
                
                // Circumvent setter
                if (view.height !== h) {
                    view.height = h;
                    if (view.inited) view.__updateBounds(view.width, h);
                    view.fireEvent('height', h);
                }
            }
        };
    
    /** A mixin that sizes the view to the width and height of the dom element.
        
        Attributes:
            width:number:string If a number the behavior is defined by the
                superclass. If a string value of 'auto' is provided sizing to
                the dom will occur. Using 'auto' allows the original SizeToDom
                behavior to be restored after an explicit width has been set.
            height:number:string If a number the behavior is defined by the
                superclass. If a string value of 'auto' is provided sizing to
                the dom will occur. Using 'auto' allows the original SizeToDom
                behavior to be restored after an explicit height has been set.
        
        Private Attributes:
            __hasSetWidth:boolean Indicates the an explicit width has been 
                set so that width should be used rather than sizing to the 
                dom element.
            __hasSetHeight:boolean Indicates the an explicit height has been 
                set so that height should be used rather than sizing to the 
                dom element.
        
        @class */
    pkg.SizeToDom = new JSModule('SizeToDom', {
        // Class Methods and Attributes ////////////////////////////////////////
        extend: {
            sizeWidth:sizeWidth,
            sizeHeight:sizeHeight
        },
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.View */
        initNode: function(parent, attrs) {
            this.callSuper(parent, attrs);
            this.sizeViewToDom();
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** @overrides myt.View */
        setWidth: function(v, suppressEvent) {
            if (setWidth(this, v)) this.callSuper(v, suppressEvent);
        },
        
        /** @overrides myt.View */
        setHeight: function(v, suppressEvent) {
            if (setHeight(this, v)) this.callSuper(v, suppressEvent);
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Call this method after any change to the width or height of the dom
            element would have occurred.
            @returns {undefined} */
        sizeViewToDom: function() {
            sizeWidth(this);
            sizeHeight(this);
        }
    });
    
    /** A variation of myt.SizeToDom that sizes the view to the width of the 
        dom element only.
        
        Attributes:
            width:number:string If a number the behavior is defined by the
                superclass. If a string value of 'auto' is provided sizing to
                the dom will occur. Using 'auto' allows the original SizeToDom
                behavior to be restored after an explicit width has been set.
        
        Private Attributes:
            __hasSetWidth:boolean Indicates the an explicit width has been 
                set so that width should be used rather than sizing to the 
                dom element.
        
        @class */
    pkg.SizeWidthToDom = new JSModule('SizeWidthToDom', {
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.View */
        initNode: function(parent, attrs) {
            this.callSuper(parent, attrs);
            this.sizeViewToDom();
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** @overrides myt.View */
        setWidth: function(v, suppressEvent) {
            if (setWidth(this, v)) this.callSuper(v, suppressEvent);
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Call this method after any change to the width of the dom
            element would have occurred.
            @returns {undefined} */
        sizeViewToDom: function() {
            sizeWidth(this);
        }
    });
    
    /** A variation of myt.SizeToDom that sizes the view to the height of the 
        dom element only.
        
        Attributes:
            height:number:string If a number the behavior is defined by the
                superclass. If a string value of 'auto' is provided sizing to
                the dom will occur. Using 'auto' allows the original SizeToDom
                behavior to be restored after an explicit height has been set.
        
        Private Attributes:
            __hasSetHeight:boolean Indicates the an explicit height has been 
                set so that height should be used rather than sizing to the 
                dom element.
        
        @class */
    pkg.SizeHeightToDom = new JSModule('SizeHeightToDom', {
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides myt.View */
        initNode: function(parent, attrs) {
            this.callSuper(parent, attrs);
            this.sizeViewToDom();
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        /** @overrides myt.View */
        setHeight: function(v, suppressEvent) {
            if (setHeight(this, v)) this.callSuper(v, suppressEvent);
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Call this method after any change to the height of the dom
            element would have occurred.
            @returns {undefined} */
        sizeViewToDom: function() {
            sizeHeight(this);
        }
    });
})(myt);
