/** An myt.PanelButton with contents that consist of an icon and text. */
myt.IconTextPanelButton = new JS.Class('IconTextPanelButton', myt.PanelButton, {
    include: [myt.IconTextButtonContent, myt.TooltipMixin],
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    doAfterAdoption: function() {
        this.syncTo(this.first, 'setInset', 'width');
        this.syncTo(this.third, 'setOutset', 'width');
        
        this.callSuper();
    }
});
