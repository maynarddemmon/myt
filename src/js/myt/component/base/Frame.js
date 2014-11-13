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
*/
myt.Frame = new JS.Class('Frame', myt.View, {
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides myt.View */
    initNode: function(parent, attrs) {
        this.callSuper(parent, attrs);
        
        var gm = myt.global.mouse;
        this.attachToDom(gm, '__doMouseDown', 'mousedown', true);
        this.attachToDom(gm, '__doMouseUp', 'mouseup', true);
    },
    
    /** @overrides myt.View */
    createOurDomElement: function(parent) {
        var elem = document.createElement('iframe'),
            s = elem.style;
        s.position = 'absolute';
        s.border = '0px';
        return elem;
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setSrc: function(v) {
        if (this.src !== v) {
            this.src = this.domElement.src = v;
            if (this.inited) this.fireNewEvent('src', v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @private */
    __doMouseDown: function(event) {
        this.__restorePointerEvents = this.pointerEvents;
        this.setPointerEvents('none');
        return true;
    },
    
    /** @private */
    __doMouseUp: function(event) {
        this.setPointerEvents(this.__restorePointerEvents);
        return true;
    }
});
