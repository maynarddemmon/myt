/** A divider that moves left/right. */
myt.HorizontalDivider = new JS.Class('HorizontalDivider', myt.BaseDivider, {
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        attrs.axis = 'x';
        this.callSuper(parent, attrs);
    }
});
