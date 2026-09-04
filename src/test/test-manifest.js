/*  The one place test suites are registered.
    
    Consumed by all three runners:
      test_runtime_src.html    loads src via the package loader, then these
      test_minified_src.html   loads dist/myt.min.js, then these
      run-tests.js             headless via jsdom, DOM independent suites only
    
    Add a new test file here and it appears in all three. Paths are relative to
    this file's directory.
    
    Set needsBrowser on suites that depend on real layout or a real user agent.
    jsdom implements the DOM but performs no layout, so offsetWidth, offsetTop
    and getBoundingClientRect are always 0 there. Those suites are skipped by
    run-tests.js and must be run in a browser. */
(exports => {
    exports.SUITES = [
        {path:'tests/shim/test-language.js'},
        
        {path:'tests/util/test-URI.js'},
        {path:'tests/util/test-Cookie.js'},
        {path:'tests/util/test-Geometry.js'},
        
        {path:'tests/core/test-ClassSystem.js'},
        {path:'tests/core/test-myt-dom.js', needsBrowser:true},
        {path:'tests/core/test-myt.js'},
        {path:'tests/core/test-Node.js'},
        {path:'tests/core/test-Node_placement.js'},
        {path:'tests/core/test-Observable.js'},
        {path:'tests/core/test-Observer.js'},
        
        {path:'tests/core/view/test-DomElementProxy.js', needsBrowser:true},
        {path:'tests/core/view/test-View.js', needsBrowser:true},
        
        {path:'tests/component/test-BoundedRangeComponent.js'},
        {path:'tests/component/test-Path.js'},
        {path:'tests/component/test-Color.js'},
        {path:'tests/component/test-ExpressionParser.js'}
    ];
    
    /** All suite paths in declaration order. Used by the browser runners. */
    exports.allPaths = () => exports.SUITES.map(suite => suite.path);
    
    /** Just the suites that can run headless under jsdom. */
    exports.headlessPaths = () => exports.SUITES.filter(suite => !suite.needsBrowser).map(suite => suite.path);
    
    /** Just the suites that need a real browser. */
    exports.browserOnlyPaths = () => exports.SUITES.filter(suite => suite.needsBrowser).map(suite => suite.path);
})(typeof module === 'object' && module.exports ? module.exports : (globalThis.MYT_TEST_MANIFEST = {}));