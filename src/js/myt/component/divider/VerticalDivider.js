/** A divider that moves left/right. */
myt.VerticalDivider = new JS.Class('VerticalDivider', myt.BaseDivider, {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        attrs.axis = 'y';
        this.callSuper(parent, attrs);
    }
});
