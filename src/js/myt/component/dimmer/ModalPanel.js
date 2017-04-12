/** An myt.Dimmer that also provides a content panel.
    
    Attributes:
        content:myt.View The content view placed inside the dimmer.
        sizingStrategy:string Determines how the content view is positioned
            relative to the bounds of the dimmer. Supported values are:
                children: The content will be sized to fit the children it
                    contains. The content will be positioned in the center and
                    middle of the dimmer. This is the default sizingStrategy
                parent: The content will be sized to the bounds of the dimmer.
                basic: The content will not be sized in any way. It will be
                    positioned in the center and middle of the dimmer.
                none: The content will not be sized or positioned in any way.
        marginTop:number The margin above the content when the sizingStrategy
            is "parent". Defaults to 40 if not provided.
        marginLeft:number The margin on the left side of the content when 
            the sizingStrategy is "parent". Defaults to 40 if not provided.
        marginBottom:number The margin below the content when the 
            sizingStrategy is "parent". Defaults to 40 if not provided.
        marginRight:number The margin on the right side of the content when 
            the sizingStrategy is "parent". Defaults to 40 if not provided.
        paddingX:number The internal horizontal padding when the sizingStrategy
            is "children". Defaults to 20 if not provided.
        paddingY:number The internal vertical padding when the sizingStrategy
            is "children". Defaults to 15 if not provided.
        
    Events:
        None
*/
myt.ModalPanel = new JS.Class('ModalPanel', myt.Dimmer, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_PADDING_X:20,
        DEFAULT_PADDING_Y:15,
        
        DEFAULT_MARGIN_TOP:40,
        DEFAULT_MARGIN_LEFT:40,
        DEFAULT_MARGIN_BOTTOM:40,
        DEFAULT_MARGIN_RIGHT:40
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.defaultPlacement = 'content';
        
        if (attrs.sizingStrategy == null) attrs.sizingStrategy = 'children';
        
        var MP = myt.ModalPanel;
        
        // Used for parent sizing strategy
        if (attrs.marginTop == null) attrs.marginTop = MP.DEFAULT_MARGIN_TOP;
        if (attrs.marginLeft == null) attrs.marginLeft = MP.DEFAULT_MARGIN_LEFT;
        if (attrs.marginBottom == null) attrs.marginBottom = MP.DEFAULT_MARGIN_BOTTOM;
        if (attrs.marginRight == null) attrs.marginRight = MP.DEFAULT_MARGIN_RIGHT;
        
        // Used for "children" sizing strategy
        if (attrs.paddingX == null) attrs.paddingX = MP.DEFAULT_PADDING_X;
        if (attrs.paddingY == null) attrs.paddingY = MP.DEFAULT_PADDING_Y;
        
        this.callSuper(parent, attrs);
    },
    
    doBeforeAdoption: function() {
        var self = this,
            M = myt,
            V = M.View,
            viewAttrs = {name:'content', ignorePlacement:true},
            centeredViewAttrs = M.extend(viewAttrs, {align:'center', valign:'middle'});
        
        self.callSuper();
        
        switch (self.sizingStrategy) {
            case 'children':
                new M.SizeToChildren(new V(self, centeredViewAttrs), {
                    name:'sizeToChildren', axis:'both',
                    paddingX:self.paddingX, 
                    paddingY:self.paddingY
                });
                break;
            case 'parent':
                new V(self, M.extend(viewAttrs, {
                    x:self.marginLeft,
                    y:self.marginTop,
                    percentOfParentWidthOffset:-self.marginLeft - self.marginRight,
                    percentOfParentHeightOffset:-self.marginTop - self.marginBottom,
                    percentOfParentWidth:100,
                    percentOfParentHeight:100,
                }), [M.SizeToParent]);
                break;
            case 'basic':
                new V(self, centeredViewAttrs);
                break;
            case 'none':
            default:
                new V(self, viewAttrs);
        }
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setSizingStrategy: function(v) {this.sizingStrategy = v;},
    
    setMarginTop: function(v) {this.marginTop = v;},
    setMarginLeft: function(v) {this.marginLeft = v;},
    setMarginBottom: function(v) {this.marginBottom = v;},
    setMarginRight: function(v) {this.marginRight = v;},
    
    setPaddingX: function(v) {this.paddingX = v;},
    setPaddingY: function(v) {this.paddingY = v;}
});
