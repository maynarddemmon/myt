module('DelayedMethodCall');

asyncTest("Add DelayedMethodCall to an instance.", function() {
    expect(3);
    
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

asyncTest("Add DelayedMethodCall to a class.", function() {
    expect(3);
    
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

asyncTest("Two calls collapse into one.", function() {
    expect(1);
    
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

asyncTest("Ensure delay is long enough.", function() {
    expect(1);
    
    var delay = 100;
    var TestClass = new JS.Class('TestClass', myt.Node, {
        doIt: function() {
            var delta = (new Date()).getTime() - now;
            ok(delta >= delay, "doIt method called before expected delay: " +  delta + " < " +  delay);
            start();
        }
    });
    
    var n = new TestClass();
    
    var now = (new Date()).getTime();
    myt.DelayedMethodCall.createDelayedMethodCall(n, delay, 'doIt');
    
    n.doItDelayed();
});
