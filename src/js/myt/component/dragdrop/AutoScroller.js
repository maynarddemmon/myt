/** Makes an myt.View auto scroll during drag and drop.
    
    Events:
        None
    
    Attributes:
        scrollBorder:number The thickness of the auto scroll border. Defaults
            to 40 pixels.
        scrollFrequency:number The time between autoscroll adjustments.
            Defaults to 50 millis.
        scrollAmount:number The number of pixels to adjust by each time.
            Defaults to 2 pixels.
        scrollAcceleration:number The amount to increase scrolling by as the
            mouse gets closer to the edge of the view. Setting this to 0 will
            result in no acceleration. Defaults to 7.
    
    Private Attributes:
        __amountscrollUp:number
        __amountscrollDown:number
        __amountscrollLeft:number
        __amountscrollRight:number
        __isAutoscrollUp:boolean
        __timerIdAutoscrollUp:number
        __isAutoscrollDown:boolean
        __timerIdAutoscrollDown:number
        __isAutoscrollLeft:boolean
        __timerIdAutoscrollLeft:number
        __isAutoscrollRight:boolean
        __timerIdAutoscrollRight:number
*/
myt.AutoScroller = new JS.Module('AutoScroller', {
    include: [myt.DragGroupSupport],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    /** @overrides */
    initNode: function(parent, attrs) {
        this.scrollBorder = 40;
        this.scrollFrequency = 50;
        this.scrollAmount = 2;
        this.scrollAcceleration = 7;
        
        if (attrs.overflow == null) attrs.overflow = 'auto';
        
        this.callSuper(parent, attrs);
        
        myt.global.dragManager.registerAutoScroller(this);
    },
    
    /** @overrides */
    destroyAfterOrphaning: function() {
        myt.global.dragManager.unregisterAutoScroller(this);
        
        this.callSuper();
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setScrollBorder: function(v) {this.scrollBorder = v;},
    setScrollFrequency: function(v) {this.scrollFrequency = v;},
    setScrollAmount: function(v) {this.scrollAmount = v;},
    setScrollAcceleration: function(v) {this.scrollAcceleration = v;},
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Called by myt.GlobalDragManager when a dropable starts being dragged
        that has a matching drag group.
        @param dropable:myt.Dropable The dropable being dragged.
        @returns void */
    notifyDragStart: function(dropable) {
        var de = this.getInnerDomElement();
        if (de.scrollHeight > de.clientHeight || de.scrollWidth > de.clientWidth) {
            this.attachToDom(myt.global.mouse, '__handleMouseMove', 'mousemove', true);
        }
    },
    
    /** Called by myt.GlobalDragManager when a dropable stops being dragged
        that has a matching drag group.
        @param dropable:myt.Dropable The dropable no longer being dragged.
        @returns void */
    notifyDragStop: function(dropable) {
        this.detachFromDom(myt.global.mouse, '__handleMouseMove', 'mousemove', true);
        
        this.__resetVScroll();
        this.__resetHScroll();
    },
    
    /** @private */
    __handleMouseMove: function(event) {
        var self = this,
            mousePos = event.value, 
            mouseX = mousePos.pageX, 
            mouseY = mousePos.pageY;
        
        if (self.containsPoint(mouseX, mouseY)) {
            var pos = self.getPagePosition(), 
                scrollBorder = self.scrollBorder;
            
            mouseX -= pos.x;
            mouseY -= pos.y;
            
            if (mouseY < scrollBorder) {
                self.__isAutoscrollUp = true;
                self.__amountscrollUp = self.__calculateAmount((scrollBorder - mouseY) / scrollBorder);
                if (!self.__timerIdAutoscrollUp) self.__doAutoScrollAdj('scrollUp', -1);
            } else if (self.height - mouseY < scrollBorder) {
                self.__isAutoscrollDown = true;
                self.__amountscrollDown = self.__calculateAmount((scrollBorder - (self.height - mouseY)) / scrollBorder);
                if (!self.__timerIdAutoscrollDown) self.__doAutoScrollAdj('scrollDown', 1);
            } else {
                self.__resetVScroll();
            }
            
            if (mouseX < scrollBorder) {
                self.__isAutoscrollLeft = true;
                self.__amountscrollLeft = self.__calculateAmount((scrollBorder - mouseX) / scrollBorder);
                if (!self.__timerIdAutoscrollLeft) self.__doAutoScrollAdj('scrollLeft', -1);
            } else if (self.width - mouseX < scrollBorder) {
                self.__isAutoscrollRight = true;
                self.__amountscrollRight = self.__calculateAmount((scrollBorder - (self.width - mouseX)) / scrollBorder);
                if (!self.__timerIdAutoscrollRight) self.__doAutoScrollAdj('scrollRight', 1);
            } else {
                self.__resetHScroll();
            }
        } else {
            self.__resetVScroll();
            self.__resetHScroll();
        }
    },
    
    /** @private */
    __calculateAmount: function(percent) {
        return Math.round(this.scrollAmount * (1 + this.scrollAcceleration * percent));
    },
    
    /** @private */
    __resetVScroll: function() {
        this.__isAutoscrollUp = this.__isAutoscrollDown = false;
        this.__timerIdAutoscrollUp = this.__timerIdAutoscrollDown = null;
    },
    
    /** @private */
    __resetHScroll: function() {
        this.__isAutoscrollLeft = this.__isAutoscrollRight = false;
        this.__timerIdAutoscrollLeft = this.__timerIdAutoscrollRight = null;
    },
    
    /** @private */
    __doAutoScrollAdj: function(dir, amt) {
        var self = this;
        
        if (self['__isAuto' + dir]) {
            self.getInnerDomElement()[dir === 'scrollUp' || dir === 'scrollDown' ? 'scrollTop' : 'scrollLeft'] += amt * self['__amount' + dir];
            
            self['__timerIdAuto' + dir] = setTimeout(function() {
                self.__doAutoScrollAdj(dir, amt);
            }, self.scrollFrequency);
        }
    }
});
