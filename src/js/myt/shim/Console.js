/** Creates a console object on old versions of IE to prevent errors. It
    doesn't actually do anything. */
if (typeof console !== 'object') {
    console = {
        log: function(v) {},
        warn: function(v) {},
        error: function(v) {}
    };
}
