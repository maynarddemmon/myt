(pkg => {
    const math = Math,
        {min:mathMin, max:mathMax} = math,
        
        cleanChannelValue = value => mathMin(255, mathMax(0, math.round(value))),
        toHex = value => cleanChannelValue(value).toString(16).padStart(2, '0'),
        rgbToHex = (red, green, blue, prependHash) => (prependHash ? '#' : '') + toHex(red) + toHex(green) + toHex(blue),
        getRedChannel = value => (0xff0000 & value) >> 16,
        getGreenChannel = value => (0x00ff00 & value) >> 8,
        getBlueChannel = value => (0x0000ff & value),
        makeColorFromNumber = value => new Color(getRedChannel(value), getGreenChannel(value), getBlueChannel(value)),
        makeColorNumberFromChannels = (red, green, blue) => (cleanChannelValue(red) << 16) + (cleanChannelValue(green) << 8) + cleanChannelValue(blue),
        toUnitRange = (num, max) => {
            if (typeof num === 'string') {
                if (num.endsWith('%')) {
                    num = parseFloat(num.slice(0, -1)) * max / 100;
                } else {
                    return 0;
                }
            }
            num = mathMin(max, mathMax(0, num)) / max;
            return math.abs(1 - num) < 0.000001 ? 1 : num;
        },
        
        rgbToHsv = (r, g, b) => {
            r = toUnitRange(r, 255);
            g = toUnitRange(g, 255);
            b = toUnitRange(b, 255);
            
            const max = mathMax(r, g, b),
                diff = max - mathMin(r, g, b);
            if (diff === 0) {
                // achromatic
                return {h:0, s:0, v:max};
            } else {
                let h;
                switch (max) {
                    case r:
                        h = (g - b) / diff + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / diff + 2;
                        break;
                    case b:
                        h = (r - g) / diff + 4;
                        break;
                }
                return {h:h * 60, s:max === 0 ? 0 : diff / max, v:max};
            }
        },
        
        hsvToRgb = (h, s, v) => {
            h = toUnitRange(h, 360) * 6;
            s = toUnitRange(s, 100);
            v = toUnitRange(v, 100);
            
            const i = math.floor(h),
                f = h - i,
                p = v * (1 - s),
                q = v * (1 - f * s),
                t = v * (1 - (1 - f) * s),
                mod = i % 6,
                red = [v, q, p, p, t, v][mod],
                green = [t, v, v, q, p, p][mod],
                blue = [p, p, t, v, v, q][mod];
            
            return {red:red * 255, green:green * 255, blue:blue * 255};
        },
        
        /** Models a color as individual color channels.
            
            Attributes:
                red:int The red channel. Will be an integer between 0 and 255.
                green:int The green channel. Will be an integer between 0 and 255.
                blue:int The blue channel. Will be an integer between 0 and 255.
            
            @class */
        Color = pkg.Color = new JS.Class('Color', {
            // Class Methods and Attributes ////////////////////////////////////
            extend: {
                toUnitRange:toUnitRange,
                rgbToHsv:rgbToHsv,
                hsvToRgb:hsvToRgb,
                
                /** Converts a number or string representation of a number to a two character 
                    hex string.
                    @param {number|string} value - The number or string to convert.
                    @returns {string} A two character hex string such as: '0c' or 'c9'. */
                toHex: toHex,
                
                /** Converts red, green, and blue color channel numbers to a six character 
                    hex string.
                    @param {number} red - The red color channel.
                    @param {number} green - The green color channel.
                    @param {number} blue - The blue color channel.
                    @param {boolean} [prependHash] - If true a '#' character will be prepended to 
                        the return value.
                    @returns {string} Something like: '#ff9c02' or 'ff9c02' */
                rgbToHex: rgbToHex,
                
                /** Limits a channel value to integers between 0 and 255.
                    @param {number} value - The channel value to clean up.
                    @returns {number} */
                cleanChannelValue: cleanChannelValue,
                
                /** Gets the red channel from a "color" number.
                    @param {string} value
                    @returns {number} */
                getRedChannel: getRedChannel,
                
                /** Gets the green channel from a "color" number.
                    @param {string} value
                    @returns {number} */
                getGreenChannel: getGreenChannel,
                
                /** Gets the blue channel from a "color" number.
                    @param {string} value
                    @returns {number} */
                getBlueChannel: getBlueChannel,
                
                /** Creates an myt.Color from a "color" number.
                    @param {string} value
                    @returns {!Object} myt.Color */
                makeColorFromNumber: makeColorFromNumber,
                
                /** Creates an myt.Color from an html color string.
                    @param {string} value - A hex string representation of a color, such 
                        as '#ff339b'.
                    @returns {!Object} a myt.Color or undefined if no color could be parsed. */
                makeColorFromHexString: value => {
                    if (value) {
                        if (value.startsWith('#')) value = value.slice(1);
                        
                        switch (value.length) {
                            case 0: value += '0'; // Append "0" to missing channels.
                            case 1: value += '0'; // Append "0" to missing channels.
                            case 2: value += '0'; // Append "0" to missing channels.
                            case 3:
                            case 4:
                            case 5:
                                // Process as: R G B ignored
                                const [r, g, b] = value;
                                return new Color(
                                    parseInt(r + r, 16),
                                    parseInt(g + g, 16),
                                    parseInt(b + b, 16)
                                );
                            case 6:
                                // Process as RR GG BB
                                return makeColorFromNumber(parseInt(value, 16));
                            default:
                                // Process as RR GG BB ignored
                                return makeColorFromNumber(parseInt(value.slice(0,6), 16));
                        }
                    }
                },
                
                /** Creates an myt.Color from hue, saturation and value parameters.
                    @param {number} h - The hue. A number from 0 to 360.
                    @param {number} s - The saturation. A number from 0 to 100.
                    @param {number} v - The value. A number from 0 to 100.
                    @returns {!Object} myt.Color */
                makeColorFromHSV: (h, s, v) => {
                    const {red, green, blue} = hsvToRgb(h, s, v);
                    return new Color(red, green, blue);
                },
                
                /** Returns the lighter of the two provided colors.
                    @param {number} a - A color number.
                    @param {number} b - A color number.
                    @returns {number} The number that represents the lighter color. */
                getLighterColor: (a, b) => makeColorFromNumber(a).isLighterThan(makeColorFromNumber(b)) ? a : b,
                
                /** Creates an RGB "color" number from the provided color channels.
                    @param {number} red - The red channel
                    @param {number} green - The green channel
                    @param {number} blue - The blue channel
                    @returns {number} */
                makeColorNumberFromChannels: makeColorNumberFromChannels,
                
                /** Creates a new myt.Color object that is a blend of the two provided colors.
                    @param {!Object} fromColor - The first myt.Color to blend.
                    @param {!Objecdt} toColor - The second myt.Color to blend.
                    @param {number} percent - The blend percent between the two colors where 0 is 
                        the fromColor and 1.0 is the toColor.
                    @returns {!Object} myt.Color */
                makeBlendedColor: (fromColor, toColor, percent) => new Color(
                    fromColor.red + (percent * (toColor.red - fromColor.red)),
                    fromColor.green + (percent * (toColor.green - fromColor.green)),
                    fromColor.blue + (percent * (toColor.blue - fromColor.blue))
                )
            },
            
            
            // Constructor /////////////////////////////////////////////////////
            /** Create a new Color.
                @param {number} red - The red channel
                @param {number} green - The green channel
                @param {number} blue - The blue channel
                @returns {undefined} */
            initialize: function(red, green, blue) {
                this.setRed(red);
                this.setGreen(green);
                this.setBlue(blue);
            },
            
            
            // Accessors ///////////////////////////////////////////////////////
            /** Sets the red channel value.
                @param {number} red
                @return {undefined} */
            setRed: function(red) {
                this.red = cleanChannelValue(red);
            },
            
            /** Sets the green channel value.
                @param {number} green
                @return {undefined} */
            setGreen: function(green) {
                this.green = cleanChannelValue(green);
            },
            
            /** Sets the blue channel value.
                @param {number} blue
                @return {undefined} */
            setBlue: function(blue) {
                this.blue = cleanChannelValue(blue);
            },
            
            
            // Methods /////////////////////////////////////////////////////////
            /** Gets the numerical representation of this color.
                @returns {number} The number that represents this color. */
            getColorNumber: function() {
                return (this.red << 16) + (this.green << 8) + this.blue;
            },
            
            /** Gets the hex string representation of this color.
                @returns {string} A hex color such as '#a0bbcc'. */
            getHtmlHexString: function() {
                return rgbToHex(this.red, this.green, this.blue, true);
            },
            
            /** Gets an HSV representation of this Color.
                @returns {!Object} With keys h, s and v. */
            getHSV: function() {
                return rgbToHsv(this.red, this.green, this.blue);
            },
            
            /** Tests if this color is lighter than the provided color.
                @param {!Object} c - The myt.Color to compare to.
                @returns {boolean} True if this color is lighter, false otherwise. */
            isLighterThan: function(c) {
                const diff = this.getDiffFrom(c);
                
                // Sum channel diffs to determine lightest color. A negative diff means a 
                // lighter color.
                return 0 > (diff.red + diff.green + diff.blue);
            },
            
            /** Gets an object holding color channel diffs.
                @param {!Object} c - The myt.Color to diff from.
                @returns {!Object} containing the diffs for the red, green and blue channels. */
            getDiffFrom: function(c) {
                return {
                    red: c.red - this.red,
                    green: c.green - this.green,
                    blue: c.blue - this.blue
                };
            },
            
            /** Applies the provided diff object to this color.
                @param {!Object} diff - The color diff to apply.
                @returns {!Object} - This myt.Color for method chaining. */
            applyDiff: function(diff) {
                return this.add(diff);
            },
            
            /** Adds the provided color to this color.
                @param {!Object} c - The myt.Color to add.
                @returns {!Object} - This myt.Color for method chaining. */
            add: function(c) {
                this.setRed(this.red + c.red);
                this.setGreen(this.green + c.green);
                this.setBlue(this.blue + c.blue);
                return this;
            },
            
            /** Subtracts the provided color from this color.
                @param {!Object} c - The myt.Color to subtract.
                @returns {!Object} - This myt.Color for method chaining. */
            subtract: function(c) {
                this.setRed(this.red - c.red);
                this.setGreen(this.green - c.green);
                this.setBlue(this.blue - c.blue);
                return this;
            },
            
            /** Multiplys this color by the provided scalar.
                @param {number} s - The scaler to multiply by.
                @returns {!Object} - This myt.Color for method chaining. */
            multiply: function(s) {
                this.setRed(this.red * s);
                this.setGreen(this.green * s);
                this.setBlue(this.blue * s);
                return this;
            },
            
            /** Divides this color by the provided scalar.
                @param {number} s - The scaler to divide by.
                @returns {!Object} - This myt.Color for method chaining. */
            divide: function(s) {
                this.setRed(this.red / s);
                this.setGreen(this.green / s);
                this.setBlue(this.blue / s);
                return this;
            },
            
            /** Clones this Color.
                @returns {!Object} - A copy of this myt.Color. */
            clone: function() {
                return new Color(this.red, this.green, this.blue);
            },
            
            /** Determine if this color has the same value as another color.
                @param {?Object} obj - The color object to test against.
                @returns {boolean} True if this color has the same color values as this provided 
                    color, false otherwise. */
            equals: function(obj) {
                return obj === this || (obj?.isA?.(Color) && 
                    obj.red === this.red && 
                    obj.green === this.green && 
                    obj.blue === this.blue);
            }
        });
})(myt);
