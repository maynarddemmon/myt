module('DelayedMethodCall');

asyncTest("Add DelayedMethodCall to an instance.", 3, function() {
    var TestClass = new JS.Class('TestClass', myt.Node, {
        doIt: function() {
            ok(true, "doIt method called.");
            start();
        }
    });
    
    var n = new TestClass();
    
    ok(myt.DelayedMethodCall.createDelayedMethodCall(n, 0, 'doIt'), "DelayedMethodCall creation succeeded.");
    ok(typeof n.doItDelayed === 'function', "A doItDelayed function should exist.");
    
    n.doItDelayed();
});

asyncTest("Add DelayedMethodCall to a class.", 3, function() {
    var TestClass = new JS.Class('TestClass', myt.Node, {
        doIt: function() {
            ok(true, "doIt method called.");
            start();
        }
    });
    
    var n = new TestClass();
    
    ok(myt.DelayedMethodCall.createDelayedMethodCall(TestClass, 0, 'doIt'), "DelayedMethodCall creation succeeded.");
    ok(typeof n.doItDelayed === 'function', "A doItDelayed function should exist.");
    
    n.doItDelayed();
});

asyncTest("Two calls collapse into one.", 1, function() {
    var TestClass = new JS.Class('TestClass', myt.Node, {
        doIt: function() {
            ok(true, "doIt method called.");
            start();
        }
    });
    
    var n = new TestClass();
    
    myt.DelayedMethodCall.createDelayedMethodCall(n, 0, 'doIt');
    
    n.doItDelayed();
    n.doItDelayed();
});

asyncTest("Ensure delay is long enough.", 1, function() {
    var TestClass = new JS.Class('TestClass', myt.Node, {
        doIt: function() {
            ok((new Date()).getTime() - now > 100, "doIt method called.");
            start();
        }
    });
    
    var n = new TestClass();
    
    var now = (new Date()).getTime();
    myt.DelayedMethodCall.createDelayedMethodCall(n, 100, 'doIt');
    
    n.doItDelayed();
});
