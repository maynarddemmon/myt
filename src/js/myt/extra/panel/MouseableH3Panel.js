/** A mixin that includes HorizontalThreePanel and BaseMouseablePanel. */
myt.MouseableH3Panel = new JS.Module('MouseableH3Panel', {
    include: [myt.BaseMouseablePanel, myt.HorizontalThreePanel],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        this.firstPrefix = 'lft';
        this.secondPrefix = 'ctr';
        this.thirdPrefix = 'rt';
        
        this.callSuper(parent, attrs);
    }
});
