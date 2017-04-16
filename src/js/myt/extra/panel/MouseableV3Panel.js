/** A mixin that includes VerticalThreePanel and BaseMouseablePanel. */
myt.MouseableV3Panel = new JS.Module('MouseableV3Panel', {
    include: [myt.VerticalThreePanel, myt.BaseMouseablePanel],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.firstPrefix = 'top';
        this.secondPrefix = 'mid';
        this.thirdPrefix = 'bot';
        
        this.callSuper(parent, attrs);
    }
});
