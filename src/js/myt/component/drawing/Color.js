/** Models a color as individual color channels.
    
    Events:
        None
   
    Attributes:
        red:int The red channel. Will be an integer between 0 and 255.
        green:int The green channel. Will be an integer between 0 and 255.
        blue:int The blue channel. Will be an integer between 0 and 255.
*/
myt.Color = new JS.Class('Color', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        /** Converts a number or string representation of a number to a 
            two character hex string.
            @param value:number/string The number or string to convert.
            @returns string: A two character hex string such as: '0c' or 'c9'. */
        toHex: function(value) {
            value = this.cleanChannelValue(value).toString(16);
            return value.length === 1 ? '0' + value : value;
        },
        
        /** Converts red, green, and blue color channel numbers to a six 
            character hex string.
            @param red:number The red color channel.
            @param green:number The green color channel.
            @param blue:number The blue color channel.
            @param prependHash:boolean (optional) If true a '#' character
                will be prepended to the return value.
            @returns string: Something like: '#ff9c02' or 'ff9c02' */
        rgbToHex: function(red, green, blue, prependHash) {
            var toHex = this.toHex.bind(this);
            return [prependHash ? '#' : '', toHex(red), toHex(green), toHex(blue)].join('');
        },
        
        /** Limits a channel value to integers between 0 and 255.
            @param value:number the channel value to clean up.
            @returns number */
        cleanChannelValue: function(value) {
            return Math.min(255, Math.max(0, Math.round(value)));
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
                this.getRedChannel(value),
                this.getGreenChannel(value),
                this.getBlueChannel(value)
            );
        },
        
        /** Creates an myt.Color from an html color string.
            @param value:string A hex string representation of a color, such
                as '#ff339b'.
            @returns myt.Color or null if no color could be parsed. */
        makeColorFromHexString: function(value) {
            if (value && value.indexOf('#') === 0) {
                return this.makeColorFromNumber(parseInt(value.substring(1), 16));
            } else {
                return null;
            }
        },
        
        /** Returns the lighter of the two provided colors.
            @param a:number A color number.
            @param b:number A color number.
            @returns The number that represents the lighter color. */
        getLighterColor: function(a, b) {
            var cA = this.makeColorFromNumber(a),
                cB = this.makeColorFromNumber(b);
            return cA.isLighterThan(cB) ? a : b;
        },
        
        /** Creates a "color" number from the provided color channels.
            @param red:number the red channel
            @param green:number the green channel
            @param blue:number the blue channel
            @returns number */
        makeColorNumberFromChannels: function(red, green, blue) {
            red = this.cleanChannelValue(red);
            green = this.cleanChannelValue(green);
            blue = this.cleanChannelValue(blue);
            return (red << 16) + (green << 8) + blue;
        },
        
        /** Creates a new myt.Color object that is a blend of the two provided
            colors.
            @param fromColor:myt.Color The first color to blend.
            @param toColor:myt.Color The second color to blend.
            @param percent:number The blend percent between the two colors
                where 0 is the fromColor and 1.0 is the toColor.
            @returns myt.Color */
        makeBlendedColor: function(fromColor, toColor, percent) {
            return new myt.Color(
                fromColor.red + (percent * (toColor.red - fromColor.red)),
                fromColor.green + (percent * (toColor.green - fromColor.green)),
                fromColor.blue + (percent * (toColor.blue - fromColor.blue))
            );
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
        @returns number: The number that represents this color. */
    getColorNumber: function() {
        return (this.red << 16) + (this.green << 8) + this.blue;
    },
    
    /** Gets the hex string representation of this color.
        @returns string: A hex color such as '#a0bbcc'. */
    getHtmlHexString: function() {
        return myt.Color.rgbToHex(this.red, this.green, this.blue, true);
    },
    
    /** Tests if this color is lighter than the provided color.
        @param c:myt.Color the color to compare to.
        @returns boolean: True if this color is lighter, false otherwise. */
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
        @returns this myt.Color to facilitate method chaining. */
    applyDiff: function(diff) {
        return this.add(diff);
    },
    
    /** Adds the provided color to this color.
        @param c:myt.Color the color to add.
        @returns this myt.Color to facilitate method chaining. */
    add: function(c) {
        this.setRed(this.red + c.red);
        this.setGreen(this.green + c.green);
        this.setBlue(this.blue + c.blue);
        return this;
    },
    
    /** Subtracts the provided color from this color.
        @param c:myt.Color the color to subtract.
        @returns this myt.Color to facilitate method chaining. */
    subtract: function(c) {
        this.setRed(this.red - c.red);
        this.setGreen(this.green - c.green);
        this.setBlue(this.blue - c.blue);
        return this;
    },
    
    /** Multiplys this color by the provided scalar.
        @param s:number the scaler to multiply by.
        @returns this myt.Color to facilitate method chaining. */
    multiply: function(s) {
        this.setRed(this.red * s);
        this.setGreen(this.green * s);
        this.setBlue(this.blue * s);
        return this;
    },
    
    /** Divides this color by the provided scalar.
        @param s:number the scaler to divide by.
        @returns this myt.Color to facilitate method chaining. */
    divide: function(s) {
        this.setRed(this.red / s);
        this.setGreen(this.green / s);
        this.setBlue(this.blue / s);
        return this;
    },
    
    /** Clones this Color.
        @returns myt.Color A copy of this myt.Color. */
    clone: function() {
        return new myt.Color(this.red, this.green, this.blue);
    },
    
    /** Determine if this color has the same value as another color.
        @returns boolean True if this color has the same color values as
            this provided color, false otherwise. */
    equals: function(obj) {
        return obj === this || (obj && obj.isA && 
            obj.isA(myt.Color) && 
            obj.red === this.red && 
            obj.green === this.green && 
            obj.blue === this.blue);
    }
});
