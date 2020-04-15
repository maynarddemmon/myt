// Spectrum Colorpicker v1.4.1
// https://github.com/bgrins/spectrum
// Author: Brian Grinstead
// License: MIT
(function (window, $, undefined) {
    "use strict";

    var defaultOpts = {
        color: false,
        allowEmpty: true,
        showSelectionPalette: true,
        localStorageKey: false,
        selectionWrapSize: 8,
        maxSelectionSize: 56,
        clearText: "Clear Color Selection",
        noColorSelectedText: "No Color Selected",
        palette: [],
        selectionPalette: []
    },
    spectrums = [],
    IE = BrowserDetect.browser === 'Explorer',
    markup = (function () {
        // IE does not support gradients with multiple stops, so we need to simulate
        //  that for the rainbow slider with 8 divs that each have a single gradient
        var gradientFix = "";
        if (IE) {
            for (var i = 1; i <= 6; i++) gradientFix += "<div class='sp-" + i + "'></div>";
        }

        return [
            "<div class='sp-container'>",
                "<div class='sp-palette-container'>",
                    "<div class='sp-palette sp-thumb sp-cf'></div>",
                "</div>",
                "<div class='sp-picker-container'>",
                    "<div class='sp-top sp-cf'>",
                        "<div class='sp-fill'></div>",
                        "<div class='sp-top-inner'>",
                            "<div class='sp-color'>",
                                "<div class='sp-sat'>",
                                    "<div class='sp-val'>",
                                        "<div class='sp-dragger'></div>",
                                    "</div>",
                                "</div>",
                            "</div>",
                            "<div class='sp-clear sp-clear-display'>",
                            "</div>",
                            "<div class='sp-hue'>",
                                "<div class='sp-slider'></div>",
                                gradientFix,
                            "</div>",
                        "</div>",
                    "</div>",
                    "<div class='sp-input-container sp-cf'>",
                        "<input class='sp-input' type='text' spellcheck='false'/>",
                    "</div>",
                    "<div class='sp-initial sp-thumb sp-cf'></div>",
                "</div>",
            "</div>"
        ].join("");
    })();

    function paletteTemplate(p, color, opts) {
        var html = [];
        for (var i = 0; i < p.length; i++) {
            var current = p[i];
            if (current) {
                var tiny = tinycolor(current);
                var c = tiny.toHsl().l < 0.5 ? "sp-thumb-el sp-thumb-dark" : "sp-thumb-el sp-thumb-light";
                c += tinycolor.equals(color, current) ? " sp-thumb-active" : "";
                var swatchStyle = "background-color:" + tiny.toHexString();
                html.push('<span title="' + tiny.toHexString() + '" data-color="' + tiny.toHexString() + '" class="' + c + '"><span class="sp-thumb-inner" style="' + swatchStyle + ';" /></span>');
            } else {
                var cls = 'sp-clear-display';
                html.push($('<div />')
                    .append($('<span data-color="" style="background-color:transparent;" class="' + cls + '"></span>')
                        .attr('title', opts.noColorSelectedText)
                    ).html()
                );
            }
        }
        return "<div class='sp-cf'>" + html.join('') + "</div>";
    }

    function spectrum(element, o) {
        var opts = myt.extend({}, defaultOpts, o),
            showSelectionPalette = opts.showSelectionPalette,
            localStorageKey = opts.localStorageKey,
            dragWidth = 0,
            dragHeight = 0,
            dragHelperHeight = 0,
            slideHeight = 0,
            slideWidth = 0,
            slideHelperHeight = 0,
            currentHue = 0,
            currentSaturation = 0,
            currentValue = 0,
            palette = [],
            paletteArray = [],
            paletteLookup = {},
            selectionPalette = opts.selectionPalette.slice(0),
            selectionWrapSize = opts.selectionWrapSize,
            maxSelectionSize = opts.maxSelectionSize,
            draggingClass = "sp-dragging",
            shiftMovementDirection = null;

        var doc = element.ownerDocument,
            body = doc.body,
            boundElement = $(element),
            container = $(markup, doc),
            pickerContainer = container.find(".sp-picker-container"),
            dragger = container.find(".sp-color"),
            dragHelper = container.find(".sp-dragger"),
            slider = container.find(".sp-hue"),
            slideHelper = container.find(".sp-slider"),
            textInput = container.find(".sp-input"),
            paletteContainer = container.find(".sp-palette"),
            initialColorContainer = container.find(".sp-initial"),
            clearButton = container.find(".sp-clear"),
            initialColor = opts.color,
            colorOnShow = false,
            isEmpty = !initialColor,
            allowEmpty = opts.allowEmpty,
            dialog = opts.dialog;

        function applyOptions() {
            if (opts.palette) {
                palette = opts.palette.slice(0);
                paletteArray = Array.isArray(palette[0]) ? palette : [palette];
                paletteLookup = {};
                for (var i = 0; i < paletteArray.length; i++) {
                    for (var j = 0; j < paletteArray[i].length; j++) {
                        var rgb = tinycolor(paletteArray[i][j]).toHexString();
                        paletteLookup[rgb] = true;
                    }
                }
            }
            container.toggleClass("sp-clear-enabled", allowEmpty);
            reflow();
        }

        function initialize() {
            if (IE) container.find("*:not(input)").attr("unselectable", "on");

            applyOptions();

            if (!allowEmpty) clearButton.hide();

            boundElement.after(container).hide();

            updateSelectionPaletteFromStorage();

            // Handle user typed input
            textInput.change(setFromTextInput);
            textInput.bind("paste", function() {
                setTimeout(setFromTextInput, 1);
            });
            textInput.keydown(function(e) {if (e.keyCode == 13) {setFromTextInput();}});

            clearButton.attr("title", opts.clearText);
            clearButton.bind("click.spectrum", function(e) {
                e.stopPropagation();
                e.preventDefault();
                isEmpty = true;
                updateUI();
            });

            draggable(slider, function(dragX, dragY) {
                currentHue = parseFloat(dragY / slideHeight);
                isEmpty = false;
                updateUI();
            }, dragStart, dragStop);

            draggable(dragger, function(dragX, dragY, e) {
                // shift+drag should snap the movement to either the x or y axis.
                if (!e.shiftKey) {
                    shiftMovementDirection = null;
                } else if (!shiftMovementDirection) {
                    var oldDragX = currentSaturation * dragWidth;
                    var oldDragY = dragHeight - (currentValue * dragHeight);
                    var furtherFromX = Math.abs(dragX - oldDragX) > Math.abs(dragY - oldDragY);
                    shiftMovementDirection = furtherFromX ? "x" : "y";
                }

                var setSaturation = !shiftMovementDirection || shiftMovementDirection === "x";
                var setValue = !shiftMovementDirection || shiftMovementDirection === "y";

                if (setSaturation) currentSaturation = parseFloat(dragX / dragWidth);
                if (setValue) currentValue = parseFloat((dragHeight - dragY) / dragHeight);

                isEmpty = false;

                updateUI();
            }, dragStart, dragStop);

            if (!!initialColor) {
                set(initialColor);
                addColorToSelectionPalette(initialColor);
            }

            reflow();
            colorOnShow = get();
            updateUI();

            function paletteElementClick(e) {
                set($(e.target).closest(".sp-thumb-el").data("color"));
                updateUI();
                return false;
            }

            var paletteEvent = IE ? "mousedown.spectrum" : "click.spectrum";
            paletteContainer.delegate(".sp-thumb-el", paletteEvent, paletteElementClick);
            initialColorContainer.delegate(".sp-thumb-el:nth-child(1)", paletteEvent, paletteElementClick);
        }

        function updateSelectionPaletteFromStorage() {
            if (localStorageKey && window.localStorage) {
                try {
                    selectionPalette = window.localStorage[localStorageKey].split(";");
                } catch (e) {}
            }
        }

        function addColorToSelectionPalette(color) {
            if (showSelectionPalette) {
                var rgb = tinycolor(color).toHexString();
                if (!paletteLookup[rgb] && $.inArray(rgb, selectionPalette) === -1) {
                    selectionPalette.push(rgb);
                    while (selectionPalette.length > maxSelectionSize) selectionPalette.shift();
                }

                if (localStorageKey && window.localStorage) {
                    try {
                        window.localStorage[localStorageKey] = selectionPalette.join(";");
                    } catch(e) {}
                }
            }
        }

        function getUniqueSelectionPalette() {
            var unique = [];
            for (var i = 0; i < selectionPalette.length; i++) {
                var rgb = tinycolor(selectionPalette[i]).toHexString();
                if (!paletteLookup[rgb]) unique.push(selectionPalette[i]);
            }
            return unique.reverse().slice(0, opts.maxSelectionSize);
        }

        function drawPalette() {
            var currentColor = get();

            var html = $.map(paletteArray, function (palette, i) {
                return paletteTemplate(palette, currentColor, opts);
            });

            updateSelectionPaletteFromStorage();

            if (selectionPalette) {
                var uniquePalette = getUniqueSelectionPalette();
                for (var i = 0, len = uniquePalette.length; len > i; i += selectionWrapSize) {
                    html.push(paletteTemplate(uniquePalette.slice(i, i + selectionWrapSize), currentColor, opts));
                }
            }

            paletteContainer.html(html.join(""));
        }

        function dragStart() {
            if (dragHeight <= 0 || dragWidth <= 0 || slideHeight <= 0) reflow();
            container.addClass(draggingClass);
            shiftMovementDirection = null;
            boundElement.trigger('dragstart.spectrum', [get()]);
        }

        function dragStop() {
            container.removeClass(draggingClass);
            boundElement.trigger('dragstop.spectrum', [get()]);
        }

        function setFromTextInput() {
            var value = textInput.val();
            if ((value === null || value === "") && allowEmpty) {
                set(null);
            } else {
                var tiny = tinycolor(value);
                if (tiny.isValid()) {
                    set(tiny);
                } else {
                    textInput.addClass("sp-validation-error");
                }
            }
        }

        function set(color) {
            if (!tinycolor.equals(color, get())) {
                var newColor, newHsv;
                if (!color && allowEmpty) {
                    isEmpty = true;
                } else {
                    isEmpty = false;
                    newColor = tinycolor(color);
                    newHsv = newColor.toHsv();
                    currentHue = (newHsv.h % 360) / 360;
                    currentSaturation = newHsv.s;
                    currentValue = newHsv.v;
                }
            }

            // Update UI just in case a validation error needs to be cleared.
            updateUI();
        }

        function get() {
            if (allowEmpty && isEmpty) return null;

            return tinycolor.fromRatio({
                h: currentHue,
                s: currentSaturation,
                v: currentValue
            });
        }

        function updateUI() {
            textInput.removeClass("sp-validation-error");

            updateHelperLocations();

            // Update dragger background color (gradients take care of saturation and value).
            var flatColor = tinycolor.fromRatio({h:currentHue, s:1, v:1});
            dragger.css("background-color", flatColor.toHexString());

            var realColor = get(),
                displayColor = (realColor || !allowEmpty) ? realColor.toHexString() : '';

            // Update the text entry input as it changes happen
            textInput.val(displayColor);

            drawPalette();

            // Draw initial
            var initial = colorOnShow;
            var current = get();
            initialColorContainer.html(paletteTemplate([initial, current], current, opts));
        }

        function updateHelperLocations() {
            if (allowEmpty && isEmpty) {
                // if selected color is empty, hide the helpers
                slideHelper.hide();
                dragHelper.hide();
            } else {
                // make sure helpers are visible
                slideHelper.show();
                dragHelper.show();

                // Where to show the little circle in that displays your current selected color
                var dragX = currentSaturation * dragWidth,
                    dragY = dragHeight - (currentValue * dragHeight);
                dragX = Math.max(
                    -dragHelperHeight,
                    Math.min(dragWidth - dragHelperHeight, dragX - dragHelperHeight)
                );
                dragY = Math.max(
                    -dragHelperHeight,
                    Math.min(dragHeight - dragHelperHeight, dragY - dragHelperHeight)
                );
                dragHelper.css({
                    "top": dragY + "px",
                    "left": dragX + "px"
                });

                // Where to show the bar that displays your current selected hue
                var slideY = currentHue * slideHeight;
                slideHelper.css({
                    "top": (slideY - slideHelperHeight) + "px"
                });
            }
        }

        function reflow() {
            dragWidth = dragger.width();
            dragHeight = dragger.height();
            dragHelperHeight = dragHelper.height();
            slideWidth = slider.width();
            slideHeight = slider.height();
            slideHelperHeight = slideHelper.height();

            updateHelperLocations();
            drawPalette();

            boundElement.trigger('reflow.spectrum');
        }

        function destroy() {
            boundElement.show();
            container.remove();
            spectrums[spect.id] = null;
        }

        function option(optionName, optionValue) {
            if (optionName == null) return myt.extend({}, opts);
            if (optionValue == null) return opts[optionName];

            opts[optionName] = optionValue;
            applyOptions();
        }

        initialize();

        var spect = {
            reflow: reflow,
            option: option,
            set: set,
            addColorToSelectionPalette: addColorToSelectionPalette,
            get: get,
            destroy: destroy,
            container: container
        };

        spect.id = spectrums.push(spect) - 1;

        dialog._spectrumCallback(spect);

        return spect;
    }

    /**
      * Lightweight drag helper.  Handles containment within the element, so that
      * when dragging, the x is within [0,element.width] and y is within [0,element.height]
      */
    function draggable(element, onmove, onstart, onstop) {
        onmove = onmove || function () { };
        onstart = onstart || function () { };
        onstop = onstop || function () { };
        var doc = element.ownerDocument || document;
        var dragging = false;
        var offset = {};
        var maxHeight = 0;
        var maxWidth = 0;

        var duringDragEvents = {};
        duringDragEvents["selectstart"] = prevent;
        duringDragEvents["dragstart"] = prevent;
        duringDragEvents["mousemove"] = move;
        duringDragEvents["mouseup"] = stop;

        function prevent(e) {
            if (e.stopPropagation) e.stopPropagation();
            if (e.preventDefault) e.preventDefault();
            e.returnValue = false;
        }

        function move(e) {
            if (dragging) {
                // Mouseup happened outside of window
                if (IE && document.documentMode < 9 && !e.button) return stop();

                var dragX = Math.max(0, Math.min(e.pageX - offset.left, maxWidth));
                var dragY = Math.max(0, Math.min(e.pageY - offset.top, maxHeight));
                onmove.apply(element, [dragX, dragY, e]);
            }
        }

        function start(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);

            if (!rightclick && !dragging) {
                if (onstart.apply(element, arguments) !== false) {
                    dragging = true;
                    maxHeight = $(element).height();
                    maxWidth = $(element).width();
                    offset = $(element).offset();

                    $(doc).bind(duringDragEvents);
                    $(doc.body).addClass("sp-dragging");

                    move(e);
                    prevent(e);
                }
            }
        }

        function stop() {
            if (dragging) {
                $(doc).unbind(duringDragEvents);
                $(doc.body).removeClass("sp-dragging");
                onstop.apply(element, arguments);
            }
            dragging = false;
        }

        $(element).bind("mousedown", start);
    }

    /**
      * Define a jQuery plugin
      */
    var dataID = "spectrum.id";
    $.fn.spectrum = function (opts, ...args) {
        if (typeof opts == "string") {
            var returnValue = this;
            this.each(function () {
                var spect = spectrums[$(this).data(dataID)];
                if (spect) {
                    var method = spect[opts];
                    if (!method) {
                        throw new Error( "Spectrum: no such method: '" + opts + "'" );
                    }

                    if (opts == "get") {
                        returnValue = spect.get();
                    } else if (opts == "container") {
                        returnValue = spect.container;
                    } else if (opts == "option") {
                        returnValue = spect.option.apply(spect, args);
                    } else if (opts == "destroy") {
                        spect.destroy();
                        $(this).removeData(dataID);
                    } else {
                        method.apply(spect, args);
                    }
                }
            });
            return returnValue;
        }

        // Initializing a new instance of spectrum
        return this.spectrum("destroy").each(function () {
            var options = myt.extend({}, opts, $(this).data());
            var spect = spectrum(this, options);
            $(this).data(dataID, spect.id);
        });
    };

    $.fn.spectrum.load = true;
    $.fn.spectrum.draggable = draggable;
    $.fn.spectrum.defaults = defaultOpts;
    $.spectrum = {};

    // TinyColor v1.0.0
    // https://github.com/bgrins/TinyColor
    // Brian Grinstead, MIT License
    (function() {

    var trimHash = /^[#]+/,
        math = Math,
        mathRound = math.round,
        mathMin = math.min,
        mathMax = math.max;

    var tinycolor = function tinycolor(color) {
        color = color ? color : '';

        // If input is already a tinycolor, return itself
        if (color instanceof tinycolor) return color;

        // If we are called as a function, call using new instead
        if (!(this instanceof tinycolor)) return new tinycolor(color);

        // Input to RGB
        var rgb = {r:0, g:0, b:0},
            ok = false;
        if (typeof color == "string") color = stringInputToObject(color);
        if (typeof color == "object") {
            if (color.hasOwnProperty("r") && color.hasOwnProperty("g") && color.hasOwnProperty("b")) {
                rgb = rgbToRgb(color.r, color.g, color.b);
                ok = true;
            } else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("v")) {
                color.s = convertToPercentage(color.s);
                color.v = convertToPercentage(color.v);
                rgb = hsvToRgb(color.h, color.s, color.v);
                ok = true;
            }
        }

        this._r = mathMin(255, mathMax(rgb.r, 0));
        this._g = mathMin(255, mathMax(rgb.g, 0));
        this._b = mathMin(255, mathMax(rgb.b, 0));
        this._ok = ok;

        // Don't let the range of [0,255] come back in [0,1].
        // Potentially lose a little bit of precision here, but will fix issues where
        // .5 gets interpreted as half of the total, instead of half of 1
        // If it was supposed to be 128, this was already taken care of by `inputToRgb`
        if (this._r < 1) this._r = mathRound(this._r);
        if (this._g < 1) this._g = mathRound(this._g);
        if (this._b < 1) this._b = mathRound(this._b);
    };

    tinycolor.prototype = {
        isValid: function() {
            return this._ok;
        },
        toHsv: function() {
            var hsv = rgbToHsv(this._r, this._g, this._b);
            return {h:hsv.h * 360, s:hsv.s, v:hsv.v};
        },
        toHsl: function() {
            var hsl = rgbToHsl(this._r, this._g, this._b);
            return {h:hsl.h * 360, s:hsl.s, l:hsl.l};
        },
        toHexString: function() {
            return myt.Color.rgbToHex(this._r, this._g, this._b, true);
        }
    };

    // If input is an object, force 1 into "1.0" to handle ratios properly
    // String input requires "1.0" as input, so 1 will be treated as 1
    tinycolor.fromRatio = function(color) {
        if (typeof color == "object") {
            var newColor = {};
            for (var i in color) {
                if (color.hasOwnProperty(i)) newColor[i] = convertToPercentage(color[i]);
            }
            color = newColor;
        }
        return tinycolor(color);
    };

    // `equals`
    // Can be called with any tinycolor input
    tinycolor.equals = function (color1, color2) {
        if (!color1 || !color2) return false;
        return tinycolor(color1).toHexString() == tinycolor(color2).toHexString();
    };

    // `rgbToHsl`, `rgbToHsv`, `hsvToRgb` modified from:
    // <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

    // `rgbToRgb`
    // Handle bounds / percentage checking to conform to CSS color spec
    // <http://www.w3.org/TR/css3-color/>
    // *Assumes:* r, g, b in [0, 255] or [0, 1]
    // *Returns:* { r, g, b } in [0, 255]
    function rgbToRgb(r, g, b){
        return {
            r:bound01(r, 255) * 255,
            g:bound01(g, 255) * 255,
            b:bound01(b, 255) * 255
        };
    }

    // `rgbToHsl`
    // Converts an RGB color value to HSL.
    // *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
    // *Returns:* { h, s, l } in [0,1]
    function rgbToHsl(r, g, b) {
        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);

        var max = mathMax(r, g, b), min = mathMin(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return {h:h, s:s, l:l};
    }

    // `rgbToHsv`
    // Converts an RGB color value to HSV
    // *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
    // *Returns:* { h, s, v } in [0,1]
    function rgbToHsv(r, g, b) {
        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);

        var max = mathMax(r, g, b), min = mathMin(r, g, b);
        var h, s, v = max;

        var d = max - min;
        s = max === 0 ? 0 : d / max;

        if (max == min) {
            h = 0; // achromatic
        } else {
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return {h:h, s:s, v:v};
    }

    // `hsvToRgb`
    // Converts an HSV color value to RGB.
    // *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
    // *Returns:* { r, g, b } in the set [0, 255]
    function hsvToRgb(h, s, v) {
        h = bound01(h, 360) * 6;
        s = bound01(s, 100);
        v = bound01(v, 100);

        var i = math.floor(h),
            f = h - i,
            p = v * (1 - s),
            q = v * (1 - f * s),
            t = v * (1 - (1 - f) * s),
            mod = i % 6,
            r = [v, q, p, p, t, v][mod],
            g = [t, v, v, q, p, p][mod],
            b = [p, p, t, v, v, q][mod];

        return {r:r * 255, g:g * 255, b:b * 255};
    }

    // Take input from [0, n] and return it as [0, 1]
    function bound01(n, max) {
        var isString = typeof n == "string";
        if (isString && n.indexOf('.') != -1 && parseFloat(n) === 1) n = "100%";

        var isPercentage = isString && n.indexOf('%') != -1;
        n = mathMin(max, mathMax(0, parseFloat(n)));

        // Automatically convert percentage into number
        if (isPercentage) n = parseInt(n * max, 10) / 100;

        // Handle floating point rounding errors
        if (math.abs(n - max) < 0.000001) return 1;

        // Convert into [0, 1] range if it isn't already
        return (n % max) / parseFloat(max);
    }

    // Replace a decimal with it's percentage value
    function convertToPercentage(n) {
        return n <= 1 ? (n * 100) + "%" : n;
    }

    var matchers = (function() {
        // Allow positive/negative integer/number. Don't capture the either/or, just the entire outcome.
        var CSS_UNIT = "(?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?)";
        return {
            rgb: new RegExp("rgb[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?"),
            hex6: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
        };
    })();

    // `stringInputToObject`
    // Permissive string parsing.  Take in a number of formats, and output an object
    // based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
    function stringInputToObject(color) {
        color = color.trim().toLowerCase().replace(trimHash, '');

        // Try to match string input using regular expressions.
        // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
        // Just return an object and let the conversion functions handle that.
        // This way the result will be the same whether the tinycolor is initialized with string or object.
        var match;
        if (match = matchers.rgb.exec(color)) return {r:match[1], g:match[2], b:match[3]};
        if (match = matchers.hex6.exec(color)) {
            return {
                r: parseInt(match[1], 16),
                g: parseInt(match[2], 16),
                b: parseInt(match[3], 16)
            };
        }
        return false;
    }

    window.tinycolor = tinycolor;
    })();

})(window, jQuery);
