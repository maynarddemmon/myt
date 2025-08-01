(pkg => {
    const JSModule = JS.Module,
        
        mathMax = Math.max,
        
        FALSE_FUNC = pkg.FALSE_FUNC,
        
        adjustListOfViews = (svs, isX, adjAmount, compounded, i=0) => {
            const len = svs.length;
            for (let compoundAdj = adjAmount; i < len; i++) {
                adjustPositionAttrOnChild(svs[i], isX, compoundAdj);
                if (compounded) compoundAdj += adjAmount;
            }
        },
        
        adjustListOfFlows = (flows, adjAmount, compounded, i=0) => {
            const len = flows.length;
            for (let compoundAdj = adjAmount; i < len;) {
                flows[i++].crossPos += compoundAdj;
                if (compounded) compoundAdj += adjAmount;
            }
        },
        
        getChildBasisSize = (child, isWidth) => isWidth ? child.getFlexBasisWidth() : child.getFlexBasisHeight(),
        
        updateSizeAttrOnChild = (child, isWidth, value, isAdjustment) => {
            child[isWidth ? 'setWidthViaFlex' : 'setHeightViaFlex']((isAdjustment ? getChildBasisSize(child, isWidth) : 0) + value);
        },
        
        updatePositionAttrOnChild = (child, isX, value) => {
            child[isX ? 'setXViaFlex' : 'setYViaFlex'](value, false);
        },
        
        adjustPositionAttrOnChild = (child, isX, value) => {
            child[isX ? 'setXViaFlex' : 'setYViaFlex'](value, true);
        },
        
        setFlexboxAttr = (flexbox, attrName, value) => {
            if (flexbox[attrName] !== value) {
                flexbox[attrName] = value;
                if (flexbox.inited) flexbox.fireEvent(attrName, value);
                flexbox.updateFlexboxLayout();
            }
        },
        
        /** Adds support for flex box to a myt.View.
            
            Attributes:
                direction:string
                    Supported values: "row", "rowReverse", "column", "columnReverse".
                wrap:string
                    Supported values: "nowrap", "wrap", "wrapReverse".
                justifyContent:string
                    Supported values: "start", "end", "center", "spaceBetween", "spaceAround", 
                    "spaceEvenly".
                alignItems:string
                    Supported values: "start", "end", "center", "stretch".
                alignContent:string
                    Supported values: "start", "end", "center", "spaceBetween", "spaceAround", 
                    "spaceEvenly", "stretch"
                rowGap:number
                columnGap:number
                
            Private Attributes:
                __flexboxPaused:boolean - Used to prevent flexbox layout updates
                    from occuring.
                __isUpdatingFlexboxLayout:boolean - Prevents infinite loops in the layout function.
            
            @class */
        FlexboxSupport = pkg.FlexboxSupport = new JSModule('FlexboxSupport', {
            // Life Cycle //////////////////////////////////////////////////////
            /** @overrides */
            initNode: function(parent, attrs) {
                this.__IS_FLEXBOX_SUPPORT = true; // Optimize FlexboxChildSupport.isChildOfFlexbox
                
                this.rowGap = this.columnGap = 0;
                this.direction ??= 'row';
                this.wrap = 'nowrap';
                this.justifyContent = this.alignContent = 'start';
                this.alignItems = 'stretch';
                
                this.callSuper(parent, attrs);
                
                this.updateFlexboxLayout();
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            /** @overrides */
            setWidth: function(v) {
                const existing = this.width;
                this.callSuper(v);
                if (existing !== this.width) this.updateFlexboxLayout();
            },
            
            /** @overrides */
            setHeight: function(v) {
                const existing = this.height;
                this.callSuper(v);
                if (existing !== this.height) this.updateFlexboxLayout();
            },
            
            setDirection: function(v) {setFlexboxAttr(this, 'direction', v);},
            setWrap: function(v) {setFlexboxAttr(this, 'wrap', v);},
            setJustifyContent: function(v) {setFlexboxAttr(this, 'justifyContent', v);},
            setAlignItems: function(v) {setFlexboxAttr(this, 'alignItems', v);},
            setAlignContent: function(v) {setFlexboxAttr(this, 'alignContent', v);},
            setRowGap: function(v) {setFlexboxAttr(this, 'rowGap', mathMax(0, v));},
            setColumnGap: function(v) {setFlexboxAttr(this, 'columnGap', mathMax(0, v));},
            
            getWidthForFlexboxLayout: function() {
                return this.width;
            },
            
            getHeightForFlexboxLayout: function() {
                return this.height;
            },
            
            setTotalBasisWidth: function(v) {this.set('totalBasisWidth', v, true);},
            setTotalBasisHeight: function(v) {this.set('totalBasisHeight', v, true);},
            
            ignoreSubviewForFlex: function(sv) {
                return sv && typeof sv.ignoreFlex === 'function' ? sv.ignoreFlex() : true;
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            setFlexboxPaused: function(v, noLayoutUpdate) {
                if (this.__flexboxPaused !== v) {
                    this.__flexboxPaused = v;
                    if (!v && !noLayoutUpdate) this.updateFlexboxLayout();
                }
            },
            isFlexboxPaused: function() {return !!this.__flexboxPaused;},
            
            /** @overrides */
            subviewAdded: function(sv) {
                this.callSuper(sv);
                if (sv && !this.ignoreSubviewForFlex(sv)) this.updateFlexboxLayout();
            },
            
            /** @overrides */
            subviewRemoved: function(sv) {
                this.callSuper(sv);
                if (sv && !this.ignoreSubviewForFlex(sv) && !this.isBeingDestroyed) this.updateFlexboxLayout();
            },
            
            /** @overrides */
            doSubviewsReorderedInDom: function(sv) {
                this.callSuper(sv);
                if (!sv || !this.ignoreSubviewForFlex(sv)) this.updateFlexboxLayout();
            },
            
            isOKToUpdateLayout: function() {
                return this.inited && !this.__isUpdatingFlexboxLayout && !this.isFlexboxPaused();
            },
            
            isCompactWidth: FALSE_FUNC,
            isCompactHeight: FALSE_FUNC,
            isCompactOnMainAxis: function(isRowDirection) {
                return isRowDirection ? this.isCompactWidth() : this.isCompactHeight();
            },
            isCompactOnCrossAxis: function(isRowDirection) {
                return isRowDirection ? this.isCompactHeight() : this.isCompactWidth();
            },
            isWrapNotAllowed: function() {
                return this.wrap === 'nowrap';
            },
            
            setUpdateAgain: function(v) {
                this._updateAgain = v;
            },
            isUpdateAgain: function() {
                return this._updateAgain;
            },
            
            updateFlexboxLayout: function() {
                const flexbox = this;
                if (flexbox.isOKToUpdateLayout()) {
                    const children = flexbox.getSubviewsInLexicalOrder().filter(sv => flexbox.ignoreSubviewForFlex(sv) !== true && sv.visible === true),
                        len = children.length;
                    if (len > 0) {
                        flexbox.__isUpdatingFlexboxLayout = true;
                        
                        const direction = flexbox.direction,
                            isRowDirection = direction.startsWith('row'),
                            isNotRowDirection = !isRowDirection,
                            
                            flexboxWidth = flexbox.getWidthForFlexboxLayout(),
                            flexboxHeight = flexbox.getHeightForFlexboxLayout(),
                            
                            mainPositionAttr = isRowDirection ? 'x' : 'y',
                            mainGap = isRowDirection ? flexbox.columnGap : flexbox.rowGap,
                            mainFlexboxSize = isRowDirection ? flexboxWidth : flexboxHeight,
                            
                            crossPositionAttr = isRowDirection ? 'y' : 'x',
                            crossGap = isRowDirection ? flexbox.rowGap : flexbox.columnGap,
                            crossFlexboxSize = isRowDirection ? flexboxHeight : flexboxWidth,
                            
                            noWrap = flexbox.isWrapNotAllowed(),
                            
                            justifyContent = flexbox.justifyContent,
                            alignItems = flexbox.alignItems,
                            alignContent = noWrap ? 'stretch' : flexbox.alignContent;
                        
                        if (direction.endsWith('Reverse')) children.reverse();
                        
                        // Basic Flow: break up the basic flow into an array of items that fit 
                        // within the mainFlexboxSize.
                        let pos = 0,
                            maxPos = 0,
                            crossPos = 0,
                            itemCount = 0,
                            currentFlow = {items:[], shrinkCount:0, shrinkBasis:0, growCount:0, extraSize:0, crossPos:crossPos, crossSize:0};
                        const flows = [currentFlow];
                        
                        for (let i = 0; i < len;) {
                            const child = children[i++],
                                childBasisSize = getChildBasisSize(child, isRowDirection),
                                childShrink = child.getShrink(),
                                childGrow = child.getGrow();
                            
                            if (
                                // We can only make new flows if we're wrapping
                                !noWrap && 
                                
                                // The current flow must have at least 1 item before we will make 
                                // a new flow.
                                currentFlow.items.length > 0 &&
                                
                                // If the next child would overflow then make a new flow
                                pos + (itemCount === 0 ? 0 : mainGap) + childBasisSize > mainFlexboxSize
                            ) {
                                currentFlow.extraSize = mainFlexboxSize - pos;
                                crossPos += currentFlow.crossSize + crossGap;
                                maxPos = mathMax(maxPos, pos);
                                
                                // Make next flow
                                pos = 0;
                                itemCount = 0;
                                currentFlow = {items:[], shrinkCount:0, shrinkBasis:0, growCount:0, extraSize:0, crossPos:crossPos, crossSize:0};
                                flows.push(currentFlow);
                            }
                            
                            if (itemCount !== 0) pos += mainGap;
                            
                            if (childShrink > 0 && childBasisSize > 0) {
                                currentFlow.shrinkCount += childShrink;
                                currentFlow.shrinkBasis += childBasisSize * childShrink;
                            }
                            if (childGrow > 0) currentFlow.growCount += childGrow;
                            currentFlow.crossSize = mathMax(currentFlow.crossSize, getChildBasisSize(child, isNotRowDirection));
                            
                            updatePositionAttrOnChild(child, isRowDirection, pos);
                            updateSizeAttrOnChild(child, isRowDirection, childBasisSize);
                            pos += childBasisSize;
                            
                            currentFlow.items.push(child);
                            itemCount++;
                        }
                        currentFlow.extraSize = mainFlexboxSize - pos;
                        crossPos += currentFlow.crossSize;
                        maxPos = mathMax(maxPos, pos);
                        
                        // Limit extraSize on all flows if the main axis must be compact
                        if (flexbox.isCompactOnMainAxis(isRowDirection)) {
                            let minExtraSize = flows.reduce(
                                (accumulator, currentValue) => {
                                    if (accumulator == null) {
                                        return currentValue.extraSize;
                                    } else {
                                        return Math.min(accumulator, currentValue.extraSize);
                                    }
                                },
                                null
                            );
                            if (minExtraSize !== 0) {
                                for (const flow of flows) flow.extraSize -= minExtraSize;
                            }
                        }
                        
                        // Total Basis Sizes
                        flexbox[isRowDirection ? 'setTotalBasisWidth' : 'setTotalBasisHeight'](maxPos);
                        flexbox[isRowDirection ? 'setTotalBasisHeight' : 'setTotalBasisWidth'](crossPos);
                        
                        // Flip the order of the flows and shift the position of each so that it is
                        // offset from the bottom/right
                        const flowLen = flows.length;
                        if (flowLen > 1 && flexbox.wrap === 'wrapReverse') {
                            for (const flow of flows) flow.crossPos = crossPos - (flow.crossPos + flow.crossSize);
                            flows.reverse();
                        }
                        
                        // Update crossSize for each flow
                        if (!flexbox.isCompactOnCrossAxis(isRowDirection)) {
                            let extraCrossSize = crossFlexboxSize - crossPos;
                            switch (alignContent) {
                                default:
                                case 'start':
                                    // This is the default and requires no change.
                                    break;
                                case 'end':
                                    // Shift every flow over to align with the end
                                    adjustListOfFlows(flows, extraCrossSize, false);
                                    break;
                                case 'center':
                                    // Shift every flow over to align with the center
                                    adjustListOfFlows(flows, extraCrossSize / 2, false);
                                    break;
                                case 'spaceBetween':
                                    // Equal space between each flow and flush to the edges. No need
                                    // to adjust if there is only 1 flow.
                                    if (flowLen > 1) adjustListOfFlows(flows, extraCrossSize / (flowLen - 1), true, 1);
                                    break;
                                case 'spaceAround':
                                    // Equal Space between each flow and half space at the edges.
                                    if (extraCrossSize <= crossGap) {
                                        // Effectively just center it.
                                        adjustListOfFlows(flows, extraCrossSize / 2, false);
                                    } else {
                                        adjustListOfFlows(flows, crossGap / 2, false);
                                        extraCrossSize -= crossGap;
                                        adjustListOfFlows(flows, extraCrossSize / (2*flowLen), true);
                                        adjustListOfFlows(flows, extraCrossSize / (2*flowLen), true, 1);
                                    }
                                    break;
                                case 'spaceEvenly':
                                    // Equal Space between each flow and space at the edges.
                                    if (extraCrossSize <= 2*crossGap) {
                                        // Effectively just center it.
                                        adjustListOfFlows(flows, extraCrossSize / 2, false);
                                    } else {
                                        adjustListOfFlows(flows, crossGap, false);
                                        extraCrossSize -= 2*crossGap;
                                        adjustListOfFlows(flows, extraCrossSize / (flowLen + 1), true);
                                    }
                                    break;
                                case 'stretch':
                                    // Stretch each row to fill the space.
                                    const flowGrowAmount = extraCrossSize / flowLen;
                                    let flowGrowAmountTotal = 0;
                                    for (const flow of flows) {
                                        flow.crossSize += flowGrowAmount;
                                        flow.crossPos += flowGrowAmountTotal;
                                        flowGrowAmountTotal += flowGrowAmount;
                                    }
                                    break;
                            }
                        }
                        
                        for (const flow of flows) {
                            const items = flow.items;
                            let extraSize = flow.extraSize;
                            if (extraSize > 0) {
                                if (flow.growCount > 0) {
                                    // Distribute extraSize using grow.
                                    const amountPerGrow = extraSize / flow.growCount;
                                    let growAmountTotal = 0;
                                    for (const item of items) {
                                        // Shift items as we go so we don't have to loop over the 
                                        // items again.
                                        if (growAmountTotal > 0) adjustPositionAttrOnChild(item, isRowDirection, growAmountTotal);
                                        
                                        const growAmount = item.getGrow() * amountPerGrow;
                                        if (growAmount > 0) {
                                            updateSizeAttrOnChild(item, isRowDirection, growAmount, true);
                                            growAmountTotal += growAmount;
                                        }
                                    }
                                } else {
                                    // Distribute extraSize using justifyContent
                                    const itemLen = items.length;
                                    switch (justifyContent) {
                                        default:
                                        case 'start':
                                            // This is the default and requires no change.
                                            break;
                                        case 'end':
                                            // Shift every item over to align with the end
                                            adjustListOfViews(items, isRowDirection, extraSize, false);
                                            break;
                                        case 'center':
                                            // Shift every item over to align with the center
                                            adjustListOfViews(items, isRowDirection, extraSize / 2, false);
                                            break;
                                        case 'spaceBetween':
                                            // Equal space between each item and flush to the edges. 
                                            // No need to adjust if there is only 1 item.
                                            if (itemLen > 1) adjustListOfViews(items, isRowDirection, extraSize / (itemLen - 1), true, 1);
                                            break;
                                        case 'spaceAround':
                                            // Equal Space between each item and half space at 
                                            // the edges.
                                            if (extraSize <= mainGap) {
                                                // Effectively just center it.
                                                adjustListOfViews(items, isRowDirection, extraSize / 2, false);
                                            } else {
                                                adjustListOfViews(items, isRowDirection, mainGap / 2, false);
                                                extraSize -= mainGap;
                                                adjustListOfViews(items, isRowDirection, extraSize / (2*itemLen), true);
                                                adjustListOfViews(items, isRowDirection, extraSize / (2*itemLen), true, 1);
                                            }
                                            break;
                                        case 'spaceEvenly':
                                            // Equal Space between each item and space at the edges.
                                            if (extraSize <= 2*mainGap) {
                                                // Effectively just center it.
                                                adjustListOfViews(items, isRowDirection, extraSize / 2, false);
                                            } else {
                                                adjustListOfViews(items, isRowDirection, mainGap, false);
                                                extraSize -= 2*mainGap;
                                                adjustListOfViews(items, isRowDirection, extraSize / (itemLen + 1), true);
                                            }
                                            break;
                                    }
                                }
                            } else if (extraSize < 0 && flow.shrinkCount > 0) {
                                // Try to zero out extraSize using shrink.
                                const shrinkBasis = flow.shrinkBasis;
                                let shrinkAmountTotal = 0;
                                // See: https://www.madebymike.com.au/writing/understanding-flexbox/ for math
                                for (const item of items) {
                                    // Shift items as we go so we don't have to loop over the 
                                    // items again.
                                    if (shrinkAmountTotal < 0) adjustPositionAttrOnChild(item, isRowDirection, shrinkAmountTotal);
                                    
                                    const shrinkAmount = (item.getShrink() * getChildBasisSize(item, isRowDirection) / shrinkBasis) * mathMax(extraSize, -shrinkBasis);
                                    if (shrinkAmount < 0) {
                                        updateSizeAttrOnChild(item, isRowDirection, shrinkAmount, true);
                                        shrinkAmountTotal += shrinkAmount;
                                    }
                                }
                            }
                            
                            // Align Items along cross-axis. */
                            let baselineOccurred = false;
                            const {crossSize, crossPos:crossPositionOffset} = flow;
                            for (const item of items) {
                                switch (item.getAlignSelf() || alignItems) {
                                    case 'start':
                                        updatePositionAttrOnChild(item, isNotRowDirection, crossPositionOffset);
                                        updateSizeAttrOnChild(item, isNotRowDirection, getChildBasisSize(item, isNotRowDirection), false);
                                        break;
                                    case 'end':
                                        updatePositionAttrOnChild(item, isNotRowDirection, crossPositionOffset + crossSize - getChildBasisSize(item, isNotRowDirection));
                                        updateSizeAttrOnChild(item, isNotRowDirection, getChildBasisSize(item, isNotRowDirection), false);
                                        break;
                                    case 'center':
                                        updatePositionAttrOnChild(item, isNotRowDirection, crossPositionOffset + (crossSize - getChildBasisSize(item, isNotRowDirection)) / 2);
                                        updateSizeAttrOnChild(item, isNotRowDirection, getChildBasisSize(item, isNotRowDirection), false);
                                        break;
                                    case 'baseline':
                                        baselineOccurred = true;
                                        updatePositionAttrOnChild(item, isNotRowDirection, crossPositionOffset + (crossSize - getChildBasisSize(item, isNotRowDirection)) / 2 + item.getFlexBaselineOffset(isRowDirection));
                                        updateSizeAttrOnChild(item, isNotRowDirection, getChildBasisSize(item, isNotRowDirection), false);
                                        break;
                                    case 'stretch':
                                    default:
                                        updatePositionAttrOnChild(item, isNotRowDirection, crossPositionOffset);
                                        updateSizeAttrOnChild(item, isNotRowDirection, crossSize, false);
                                        break;
                                }
                            }
                            
                            if (baselineOccurred) flexbox.updateFlexboxLayoutBaselineAdjustment(items, isRowDirection, crossPositionOffset);
                        }
                        
                        flexbox.__isUpdatingFlexboxLayout = false;
                        
                        if (flexbox.isUpdateAgain() && !flexbox.__UPDATE_AGAIN_LOOP_PROTECTION) {
                            flexbox.setUpdateAgain(false);
                            flexbox.__UPDATE_AGAIN_LOOP_PROTECTION = true;
                            flexbox.updateFlexboxLayout();
                            flexbox.__UPDATE_AGAIN_LOOP_PROTECTION = false;
                        }
                    } else {
                        flexbox.setTotalBasisWidth(0);
                        flexbox.setTotalBasisHeight(0);
                    }
                }
            },
            
            updateFlexboxLayoutBaselineAdjustment: pkg.NOOP // (items, isRowDirection, crossPositionOffset) => {}
        });
    
    /** Adds support for flex box child behavior to a myt.View.
        
        Attributes:
            grow:number - Supported values: Non-negative numbers.
            alignSelf:string - Supported values: "auto", start", "end", "center", "stretch". The 
                value "auto" can be used to unset this attr.
        
        Private Attributes:
            __ignoreFlex:boolean - When true, this View is ignored by the flexbox parent.
            __basisWidth:number - The preferred width of this View for calculating the size of this 
                View in a flexbox. This value gets set whenever the flexbox layout changes the 
                width of this view so it can be referenced in future layout updates.
            __basisHeight:number - The preferred height of this View for calculating the size of 
                this View in a flexbox. This value gets set whenever the flexbox layout changes the 
                height of this view so it can be referenced in future layout updates.
            __isFlexUpdate:boolean - Prevents clearing of basis size during a flexbox layout update.
        
        @class */
    pkg.FlexboxChildSupport = new JSModule('FlexboxChildSupport', {
        // Accessors ///////////////////////////////////////////////////////////
        /** @overrides */
        setVisible: function(v) {
            if (this.visible !== v) {
                this.callSuper(v);
                this.updateFlexboxLayoutFromChild();
            }
        },
        
        /** Provides a hook for subclasses to intervene when the x position is being updated by the 
            flex layout. */
        setXViaFlex(v, isAdj) {
            if (isAdj) v += this.x;
            if (this.x !== v) {
                this.__isFlexUpdate = true;
                this.setX(v);
                this.__isFlexUpdate = false;
            }
        },
        
        /** Provides a hook for subclasses to intervene when the y position is being updated by the 
            flex layout. */
        setYViaFlex(v, isAdj) {
            if (isAdj) v += this.y;
            if (this.y !== v) {
                this.__isFlexUpdate = true;
                this.setY(v);
                this.__isFlexUpdate = false;
            }
        },
        
        /** @overrides */
        setWidth: function(v) {
            const isChanging = this.width !== v;
            if (isChanging && !this.__isFlexUpdate) this.__basisWidth = null;
            this.callSuper(v);
            if (isChanging) this.updateFlexboxLayoutFromChild();
        },
        
        setWidthViaFlex(v) {
            if (this.width !== v) {
                this.__basisWidth ??= this.width;
                
                this.__isFlexUpdate = true;
                this.setWidth(v);
                this.__isFlexUpdate = false;
            }
        },
        
        getFlexBasisWidth: function() {
            return this.__basisWidth ?? this.width;
        },
        
        /** @overrides */
        setHeight: function(v) {
            const isChanging = this.height !== v;
            if (isChanging && !this.__isFlexUpdate) this.__basisHeight = null;
            this.callSuper(v);
            if (isChanging) this.updateFlexboxLayoutFromChild();
        },
        
        setHeightViaFlex(v) {
            if (this.height !== v) {
                this.__basisHeight ??= this.height;
                
                this.__isFlexUpdate = true;
                this.setHeight(v);
                this.__isFlexUpdate = false;
            }
        },
        
        getFlexBasisHeight: function() {
            return this.__basisHeight ?? this.height;
        },
        
        /** Subclasses should override this to provide a more appropriate baseline offset 
            as needed. */
        getFlexBaselineOffset: isRowDirection => 0,
        
        setIgnoreFlex: function(v) {
            if (this.__ignoreFlex !== v) {
                this.__ignoreFlex = v;
                if (this.inited) {
                    this.fireEvent('ignoreFlex', v);
                    if (this.isChildOfFlexbox()) this.parent.updateFlexboxLayout();
                }
            }
        },
        
        ignoreFlex: function() {
            return this.__ignoreFlex;
        },
        
        setGrow: function(v) {
            v = mathMax(0, v);
            if (this.grow !== v) {
                this.grow = v;
                if (this.inited) {
                    this.fireEvent('grow', v);
                    this.updateFlexboxLayoutFromChild();
                }
            }
        },
        
        getGrow: function() {return this.grow;},
        
        setShrink: function(v) {
            v = mathMax(0, v);
            if (this.shrink !== v) {
                this.shrink = v;
                if (this.inited) {
                    this.fireEvent('shrink', v);
                    this.updateFlexboxLayoutFromChild();
                }
            }
        },
        
        getShrink: function() {return this.shrink;},
        
        setAlignSelf: function(v) {
            if (this.alignSelf !== v) {
                this.alignSelf = v;
                if (this.inited) {
                    this.fireEvent('alignSelf', v);
                    this.updateFlexboxLayoutFromChild();
                }
            }
        },
        
        getAlignSelf: function() {
            const alignSelf = this.alignSelf;
            return (alignSelf === 'auto' || alignSelf === '') ? null : alignSelf;
        },
        
        
        // Methods /////////////////////////////////////////////////////////////
        isChildOfFlexbox: function() {
            return !!(this.parent && this.parent.__IS_FLEXBOX_SUPPORT);
        },
        
        isFlexUpdateInProgress: function() {return this.__isFlexUpdate;},
        
        updateFlexboxLayoutFromChild: function() {
            if (this.inited && !this.ignoreFlex() && this.isChildOfFlexbox()) {
                if (this.isFlexUpdateInProgress()) {
                    this.parent.setUpdateAgain(true);
                } else {
                    this.parent.updateFlexboxLayout();
                }
            }
        }
    });
})(myt);
