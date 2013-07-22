/** Models a color as individual color channels. */
myt.Color = new JS.Class('Color', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** Limits a channel value to integers between 0 and 255.
            @param value:number the channel value to clean up.
            @returns number */
        cleanChannelValue: function(value) {
            value = Math.round(value);
            
            if (value > 255) {
                return 255;
            } else if (value < 0) {
                return 0;
            } else {
                return value;
            }
        },
        
        /** Gets the red channel from a "color" number.
            @return number */
        getRedChannel: function(value) {
            return (0xff0000 & value) >> 16;
        },
        
        /** Gets the green channel from a "color" number.
            @returns number */
        getGreenChannel: function(value) {
            return (0x00ff00 & value) >> 8;
        },
        
        /** Gets the blue channel from a "color" number.
            @returns number */
        getBlueChannel: function(value) {
            return (0x0000ff & value);
        },
        
        /** Creates an myt.Color from a "color" number.
            @returns myt.Color */
        makeColorFromNumber: function(value) {
            return new myt.Color(
                myt.Color.getRedChannel(value),
                myt.Color.getGreenChannel(value),
                myt.Color.getBlueChannel(value)
            );
        },
        
        /** Creates an myt.Color from an html color string.
            @returns myt.Color */
        makeColorFromHexString: function(value) {
            if (value.indexOf('#') === 0) value = value.substring(1);
            var num = parseInt(value, 16);
            return myt.Color.makeColorFromNumber(num);
        },
        
        /** Returns the lighter of the two provided colors. */
        getLighterColor: function(a, b) {
            var cA = myt.Color.makeColorFromNumber(a),
                cB = myt.Color.makeColorFromNumber(b),
                isLighter = cA.isLighterThan(cB);
            return isLighter ? a : b;
        },
        
        /** Creates a "color" number from the provided color channels.
            @param red:number the red channel
            @param green:number the green channel
            @param blue:number the blue channel
            @returns number */
        makeColorNumberFromChannels: function(red, green, blue) {
            red = myt.Color.cleanChannelValue(red);
            green = myt.Color.cleanChannelValue(green);
            blue = myt.Color.cleanChannelValue(blue);
            return (red << 16) + (green << 8) + blue;
        }
    },
    
    
    // Constructor /////////////////////////////////////////////////////////////
    /** Create a new Color.
        @param red:number the red channel
        @param green:number the green channel
        @param blue:number the blue channel */
    initialize: function(red, green, blue) {
        this.setRed(red);
        this.setGreen(green);
        this.setBlue(blue);
    },
    
    
    // Accessors ///////////////////////////////////////////////////////////////
    /** Sets the red channel value. */
    setRed: function(red) {
        this.red = myt.Color.cleanChannelValue(red);
    },
    
    /** Sets the green channel value. */
    setGreen: function(green) {
        this.green = myt.Color.cleanChannelValue(green);
    },
    
    /** Sets the blue channel value. */
    setBlue: function(blue) {
        this.blue = myt.Color.cleanChannelValue(blue);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    /** Gets the numerical representation of this color.
        @returns number */
    getColorNumber: function() {
        return (this.red << 16) + (this.green << 8) + this.blue;
    },
    
    _toHex: function(v) {
        var str = Number(v).toString(16); 
        return str.length === 1 ? "0" + str : str; 
    },
    
    getHtmlHexString: function() {
        return "#" + this._toHex(this.red) + this._toHex(this.green) + this._toHex(this.blue);
    },
    
    /** Tests if this color is lighter than the provided color.
        @param c:myt.Color the color to compare to.
        @returns boolean */
    isLighterThan: function(c) {
        var diff = this.getDiffFrom(c);
        
        // Sum channel diffs to determine lightest color. A negative diff
        // means a lighter color.
        return 0 > (diff.red + diff.green + diff.blue);
    },
    
    /** Gets an object holding color channel diffs.
        @param c:myt.Color the color to diff from.
        @returns object containing the diffs for the red, green and blue
            channels. */
    getDiffFrom: function(c) {
        return {
            red: c.red - this.red,
            green: c.green - this.green,
            blue: c.blue - this.blue
        };
    },
    
    /** Applies the provided diff object to this color.
        @param diff:object the color diff to apply.
        @returns void */
    applyDiff: function(diff) {
        this.setRed(this.red + diff.red);
        this.setGreen(this.green + diff.green);
        this.setBlue(this.blue + diff.blue);
        return this;
    },
    
    /** Adds the provided color to this color.
        @param c:myt.Color the color to add.
        @returns this color to facilitate method chaining. */
    add: function(c) {
        this.setRed(this.red + c.red);
        this.setGreen(this.green + c.green);
        this.setBlue(this.blue + c.blue);
        return this;
    },
    
    /** Subtracts the provided color from this color.
        @param c:myt.Color the color to subtract.
        @returns this color to facilitate method chaining. */
    subtract: function(c) {
        this.setRed(this.red - c.red);
        this.setGreen(this.green - c.green);
        this.setBlue(this.blue - c.blue);
        return this;
    },
    
    /** Multiplys this color by the provided scalar.
        @param s:number the scaler to multiply by.
        @returns this color to facilitate method chaining. */
    multiply: function(s) {
        this.setRed(this.red * s);
        this.setGreen(this.green * s);
        this.setBlue(this.blue * s);
        return this;
    },
    
    /** Divides this color by the provided scalar.
        @param s:number the scaler to divide by.
        @returns this color to facilitate method chaining. */
    divide: function(s) {
        this.setRed(this.red / s);
        this.setGreen(this.green / s);
        this.setBlue(this.blue / s);
        return this;
    },
    
    /** Clones this Color. */
    clone: function() {
        return new myt.Color(this.red, this.green, this.blue);
    }
});
