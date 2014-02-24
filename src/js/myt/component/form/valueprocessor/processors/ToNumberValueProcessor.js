/** Converts values to a Number if possible. If the value becomes NaN
    the original value is returned. */
myt.ToNumberValueProcessor = new JS.Class('ToNumberValueProcessor', myt.ValueProcessor, {
    // Methods /////////////////////////////////////////////////////////////////
    /** @overrides myt.ValueProcessor */
    process: function(v) {
        // Don't convert "empty" values to a number since they'll become zero
        // which is probably incorrect. Also catch undefined/null values since
        // they will become NaN.
        if (v == null || v === "" || v === "-") return v;
        
        var numericValue = Number(v);
        return isNaN(numericValue) ? v : numericValue;
    }
});
