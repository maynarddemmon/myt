(pkg => {
    const JSClass = JS.Class,
        
        RadialGuage = pkg.RadialGuage = new JSClass('RadialGuage', pkg.View, {
            include:[pkg.BoundedValueComponent],
            
            
            // Life Cycle //////////////////////////////////////////////////////
            initNode: function(parent, attrs) {
                const self = this;
                
                attrs.radius ??= 32;
                attrs.thickness ??= 4;
                attrs.startAngle ??= 270;
                attrs.color ??= '#666';
                
                const fontSize = attrs.fontSize ?? attrs.radius;
                
                self.quickSet(['radius','thickness','startAngle','color'], attrs);
                const thickness = self.thickness,
                    radius = self.radius;
                
                attrs.width = attrs.height = 2*radius;
                
                //attrs.snapToInt ??= false;
                attrs.minValue ??= 0;
                attrs.maxValue ??= 100;
                attrs.value ??= 0;
                
                attrs.bgColor ??= '#fff';
                attrs.roundedCorners = radius + thickness;
                attrs.borderWidth ??= thickness;
                attrs.borderStyle ??= 'solid';
                attrs.borderColor ??= '#ccc';
                
                self.callSuper(parent, attrs);
                
                self._progressView = new pkg.Annulus(self, {
                    x:-thickness, y:-thickness,
                    radius:radius, thickness:thickness, startAngle:self.startAngle
                });
                
                self._valueView = new pkg.Text(self, {
                    fontSize:fontSize + 'px', align:'center', valign:'middle'
                });
                
                self.redraw();
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            setMinValue: function(v) {
                this.callSuper(v);
                if (this.inited) this.redraw();
            },
            
            setMaxValue: function(v) {
                this.callSuper(v);
                if (this.inited) this.redraw();
            },
            
            setValue: function(v) {
                this.callSuper(v);
                if (this.inited) this.redraw();
            },
            
            // Methods /////////////////////////////////////////////////////////
            redraw: function() {
                const progressView = this._progressView,
                    valueView = this._valueView,
                    value = this.value,
                    percent = value / (this.maxValue - this.minValue),
                    color = this.getColorByValue(value, percent);
                progressView.setEndAngle(this.startAngle + 360 * percent);
                progressView.setColor(color);
                valueView.setText(this.getTextByValue(value));
                valueView.setTextColor(color);
                this.setTooltip(this.getTooltipByValue(value));
            },
            
            getColorByValue: function(value, percent) {
                return this.color;
            },
            getTooltipByValue: function(value) {
                return this.getTextByValue(value);
            },
            getTextByValue: function(value) {
                return '' + value;
            }
        });
    
    pkg.ColorThresholdRadialGuage = new JSClass('ColorThresholdRadialGuage', RadialGuage, {
        initNode: function(parent, attrs) {
            attrs.thresholdType ??= 'percent';
            attrs.thresholds ??= [];
            this.quickSet(['thresholdType','thresholds'], attrs);
            this.thresholds.sort((a, b) => b.value - a.value);
            
            this.callSuper(parent, attrs);
        },
        
        getColorByValue: function(value, percent) {
            const valueToCompare = this.thresholdType === 'percent' ? percent : value;
            for (const threshold of this.thresholds) {
                if (valueToCompare >= threshold.value) return threshold.color;
            }
            return this.callSuper(value, percent);
        }
    });
})(myt);
