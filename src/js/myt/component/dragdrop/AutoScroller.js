((pkg) => {
    const G = pkg.global,
        dragManager = G.dragManager,
        globalMouse = G.mouse,
        
        /*  @param {!Object} autoScroller
            @param {string} dir - The direction to scroll.
            @param {number} amt - The amount to scroll.
            @returns {undefined} */
        doAutoScrollAdj = (autoScroller, dir, amt) => {
            if (autoScroller['__isAuto' + dir]) {
                autoScroller.getInnerDomElement()[dir === 'scrollUp' || dir === 'scrollDown' ? 'scrollTop' : 'scrollLeft'] += amt * autoScroller['__amount' + dir];
                
                autoScroller['__timerIdAuto' + dir] = setTimeout(() => {
                    doAutoScrollAdj(autoScroller, dir, amt);
                }, autoScroller.scrollFrequency);
            }
        },
        
        /*  @param {!Object} autoScroller
            @param {number} percent - The percent of scroll acceleration to use.
            @returns {number} */
        calculateAmount = (autoScroller, percent) => Math.round(autoScroller.scrollAmount * (1 + autoScroller.scrollAcceleration * percent)),
        
        /*  @param {!Object} autoScroller
            @returns {undefined} */
        resetVScroll = (autoScroller) => {
            autoScroller.__isAutoscrollUp = autoScroller.__isAutoscrollDown = false;
            autoScroller.__timerIdAutoscrollUp = autoScroller.__timerIdAutoscrollDown = null;
        },
        
        /*  @param {!Object} autoScroller
            @returns {undefined} */
        resetHScroll = (autoScroller) => {
            autoScroller.__isAutoscrollLeft = autoScroller.__isAutoscrollRight = false;
            autoScroller.__timerIdAutoscrollLeft = autoScroller.__timerIdAutoscrollRight = null;
        };
    
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
    pkg.AutoScroller = new JS.Module('AutoScroller', {
        include: [pkg.DragGroupSupport],
        
        
        // Life Cycle //////////////////////////////////////////////////////////
        /** @overrides */
        initNode: function(parent, attrs) {
            this.scrollBorder = 40;
            this.scrollFrequency = 50;
            this.scrollAmount = 2;
            this.scrollAcceleration = 7;
            
            if (attrs.overflow == null) attrs.overflow = 'auto';
            
            this.callSuper(parent, attrs);
            
            dragManager.registerAutoScroller(this);
        },
        
        /** @overrides */
        destroyAfterOrphaning: function() {
            dragManager.unregisterAutoScroller(this);
            
            this.callSuper();
        },
        
        
        // Accessors ///////////////////////////////////////////////////////////
        setScrollBorder: function(v) {this.scrollBorder = v;},
        setScrollFrequency: function(v) {this.scrollFrequency = v;},
        setScrollAmount: function(v) {this.scrollAmount = v;},
        setScrollAcceleration: function(v) {this.scrollAcceleration = v;},
        
        
        // Methods /////////////////////////////////////////////////////////////
        /** Called by myt.GlobalDragManager when a dropable starts being dragged
            that has a matching drag group.
            @param {!Object} dropable - The myt.Dropable being dragged.
            @returns {undefined} */
        notifyDragStart: function(dropable) {
            const de = this.getInnerDomElement();
            if (de.scrollHeight > de.clientHeight || de.scrollWidth > de.clientWidth) {
                this.attachToDom(globalMouse, '__handleMouseMove', 'mousemove', true);
            }
        },
        
        /** Called by myt.GlobalDragManager when a dropable stops being dragged
            that has a matching drag group.
            @param {!Object} dropable - The myt.Dropable no longer being dragged.
            @returns {undefined} */
        notifyDragStop: function(dropable) {
            this.detachFromDom(globalMouse, '__handleMouseMove', 'mousemove', true);
            
            resetVScroll(this);
            resetHScroll(this);
        },
        
        /** @private
            @param {!Object} event
            @returns {undefined} */
        __handleMouseMove: function(event) {
            const self = this,
                mousePos = event.value;
            let mouseX = mousePos.pageX, 
                mouseY = mousePos.pageY;
            
            if (self.containsPoint(mouseX, mouseY)) {
                const pos = self.getPagePosition(), 
                    scrollBorder = self.scrollBorder;
                
                mouseX -= pos.x;
                mouseY -= pos.y;
                
                if (mouseY < scrollBorder) {
                    self.__isAutoscrollUp = true;
                    self.__amountscrollUp = calculateAmount(self, (scrollBorder - mouseY) / scrollBorder);
                    if (!self.__timerIdAutoscrollUp) doAutoScrollAdj(self, 'scrollUp', -1);
                } else if (self.height - mouseY < scrollBorder) {
                    self.__isAutoscrollDown = true;
                    self.__amountscrollDown = calculateAmount(self, (scrollBorder - (self.height - mouseY)) / scrollBorder);
                    if (!self.__timerIdAutoscrollDown) doAutoScrollAdj(self, 'scrollDown', 1);
                } else {
                    resetVScroll(self);
                }
                
                if (mouseX < scrollBorder) {
                    self.__isAutoscrollLeft = true;
                    self.__amountscrollLeft = calculateAmount(self, (scrollBorder - mouseX) / scrollBorder);
                    if (!self.__timerIdAutoscrollLeft) doAutoScrollAdj(self, 'scrollLeft', -1);
                } else if (self.width - mouseX < scrollBorder) {
                    self.__isAutoscrollRight = true;
                    self.__amountscrollRight = calculateAmount(self, (scrollBorder - (self.width - mouseX)) / scrollBorder);
                    if (!self.__timerIdAutoscrollRight) doAutoScrollAdj(self, 'scrollRight', 1);
                } else {
                    resetHScroll(self);
                }
            } else {
                resetVScroll(self);
                resetHScroll(self);
            }
        }
    });
})(myt);
