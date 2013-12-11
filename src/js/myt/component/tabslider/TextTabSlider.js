/** A tab slider with a text label. */
myt.TextTabSlider = new JS.Class('TextTabSlider', myt.TabSlider, {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        DEFAULT_LABEL_TEXT_COLOR_CHECKED: '#ffffff',
        DEFAULT_LABEL_TEXT_COLOR: '#333333'
    },
    
    
    // Life Cycle //////////////////////////////////////////////////////////////
    initNode: function(parent, attrs) {
        var TTS = myt.TextTabSlider;
        if (attrs.labelTextColorChecked === undefined) attrs.labelTextColorChecked = TTS.DEFAULT_LABEL_TEXT_COLOR_CHECKED;
        if (attrs.labelTextColor === undefined) attrs.labelTextColor = TTS.DEFAULT_LABEL_TEXT_COLOR;
        
        this.callSuper(parent, attrs);
    },
    
    doAfterAdoption: function() {
        this.callSuper();
        
        new myt.Text(this.button, {
            name:'label', domClass:'mytTextTabSliderLabel', ignorePlacement:true,
            text:this.text, align:'center', valign:'middle', 
            textColor:this.determineTextColor(this.button.checked)
        });
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    setLabelTextColorChecked: function(v) {this.labelTextColorChecked = v;},
    setLabelTextColor: function(v) {this.labelTextColor = v;},
    
    setText: function(v) {
        if (this.text !== v) {
            this.text = v;
            if (this.button && this.button.label) this.button.label.setText(v);
        }
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.TabSlider */
    notifyButtonRedraw: function(state) {
        var btn = this.button;
        if (btn.label) btn.label.setTextColor(this.determineTextColor(btn.checked));
    },
    
    determineTextColor: function(checked) {
        return checked ? this.labelTextColorChecked : this.labelTextColor;
    }
});
