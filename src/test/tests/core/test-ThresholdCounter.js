module('ThresholdCounter');

test("Add ThresholdCounter to an instance.", function() {
    var TestClass = new JS.Class('TestClass', myt.Node, {});
    
    var n = new TestClass();
    
    ok(myt.ThresholdCounter.createThresholdCounter(n, 'exceeded', 'counter', 'threshold'), "ThresholdCounter creation succeeded.");
    
    ok(typeof n.incrementCounter === 'function', "An incrementCounter function should exist.");
    ok(typeof n.decrementCounter === 'function', "A decrementCounter function should exist.");
    ok(typeof n.setThreshold === 'function', "A setThreshold function should exist.");
    
    // Initialize the instance
    myt.ThresholdCounter.initializeThresholdCounter(n, 2, 3, 'exceeded', 'counter', 'threshold');
    
    ok(n.counter === 2, "Counter attribute should be set.");
    ok(n.threshold === 3, "Threshold attribute should be set.");
    ok(n.exceeded === false, "Exceeded should be false, was: " + n.exceeded);
    
    // Verify that an exceeded event fires
    var observer = new myt.Node(null, null, [{
        handleExceededEvent: function(e) {
            this.observedExceeded = e.value;
        }
    }]);
    n.attachObserver(observer, 'handleExceededEvent', 'exceeded');
    ok(observer.observedExceeded === undefined, "Observer should not have seen an event yet.");
    
    n.incrementCounter();
    
    ok(n.counter === 3, "Counter should now be 3.");
    ok(n.exceeded === true, "Exceeded should now be true.");
    ok(observer.observedExceeded === true, "Observer should have seen an event.");
    
    n.decrementCounter();
    
    ok(n.counter === 2, "Counter should now be 2 since we decrement below threshold.");
    ok(n.exceeded === false, "Exceeded should now be false.");
    ok(observer.observedExceeded === false, "Observer should have seen an event.");
    
    // Changing threshold should update 'exceeded' attribute.
    n.setThreshold(2);
    
    ok(n.threshold === 2, "Threshold should now be 2.");
    ok(n.exceeded === true, "Exceeded should now be true.");
    ok(observer.observedExceeded === true, "Observer should have seen an event.");
    
    // Don't allow decrement below 0
    n.decrementCounter(5);
    
    ok(n.counter === 0, "Counter should still be 0 but was: " + n.counter);
    
    // Test creation failure
    ok(myt.ThresholdCounter.createThresholdCounter(n, 'exceeded', 'counter', 'threshold') === false, "Creation should fail when functions would be clobbered.");
    
    observer.destroy();
    n.destroy();
});

test("Add ThresholdCounter to a class.", function() {
    var TestClass = new JS.Class('TestClass', myt.Node, {});
    
    var n = new TestClass();
    
    // Also test default attribute naming
    ok(myt.ThresholdCounter.createThresholdCounter(TestClass, 'locked'), "ThresholdCounter creation succeeded.");
    
    ok(typeof n.incrementLockedCounter === 'function', "An incrementLockedCounter function should exist.");
    ok(typeof n.decrementLockedCounter === 'function', "A decrementLockedCounter function should exist.");
    ok(typeof n.setLockedThreshold === 'function', "A setLockedThreshold function should exist.");
    
    // Initialize the instance
    myt.ThresholdCounter.initializeThresholdCounter(n, 2, 3, 'locked');
    
    ok(n.lockedCounter === 2, "Counter attribute should be set.");
    ok(n.lockedThreshold === 3, "Threshold attribute should be set.");
    ok(n.locked === false, "Locked should be false, was: " + n.locked);
    
    // Verify that an exceeded event fires
    var observer = new myt.Node(null, null, [{
        handleLockedEvent: function(e) {
            this.observedLocked = e.value;
        }
    }]);
    n.attachObserver(observer, 'handleLockedEvent', 'locked');
    ok(observer.observedLocked === undefined, "Observer should not have seen an event yet.");
    
    n.incrementLockedCounter();
    
    ok(n.lockedCounter === 3, "Counter should now be 3.");
    ok(n.locked === true, "Locked should now be true.");
    ok(observer.observedLocked === true, "Observer should have seen an event.");
    
    n.decrementLockedCounter();
    
    ok(n.lockedCounter === 2, "Counter should now be 2 since we decrement below threshold.");
    ok(n.locked === false, "Locked should now be false.");
    ok(observer.observedLocked === false, "Observer should have seen an event.");
    
    // Test creation failure
    ok(myt.ThresholdCounter.createThresholdCounter(TestClass, 'locked') === false, "Creation should fail when functions would be clobbered.");
    
    observer.destroy();
    n.destroy();
});

test("ThresholdCounter instance.", function() {
    var n = new myt.ThresholdCounter(2, 3);
    
    ok(typeof n.incrementCounter === 'function', "An incrementCounter function should exist.");
    ok(typeof n.decrementCounter === 'function', "A decrementCounter function should exist.");
    ok(typeof n.setThreshold === 'function', "A setThreshold function should exist.");
    
    ok(n.counter === 2, "Counter attribute should be set.");
    ok(n.threshold === 3, "Threshold attribute should be set.");
    ok(n.exceeded === false, "Exceeded should be false, was: " + n.exceeded);
    
    // Verify that an exceeded event fires
    var observer = new myt.Node(null, null, [{
        handleExceededEvent: function(e) {
            this.observedExceeded = e.value;
        }
    }]);
    n.attachObserver(observer, 'handleExceededEvent', 'exceeded');
    ok(observer.observedExceeded === undefined, "Observer should not have seen an event yet.");
    
    n.incrementCounter();
    
    ok(n.counter === 3, "Counter should now be 3.");
    ok(n.exceeded === true, "Exceeded should now be true.");
    ok(observer.observedExceeded === true, "Observer should have seen an event.");
    
    n.decrementCounter();
    
    ok(n.counter === 2, "Counter should now be 2 since we decrement below threshold.");
    ok(n.exceeded === false, "Exceeded should now be false.");
    ok(observer.observedExceeded === false, "Observer should have seen an event.");
    
    observer.destroy();
    n.destroy();
});


test("Add a ThresholdCounter to a Module mixed onto a Class.", function() {
    var TestModule = new JS.Module('TestModule', {});
    var TestClass = new JS.Class('TestClass', myt.Node, {include: [TestModule]});
    
    var n = new TestClass();
    
    ok(myt.ThresholdCounter.createThresholdCounter(TestClass, 'locked'), "ThresholdCounter creation succeeded.");
    ok(myt.ThresholdCounter.createThresholdCounter(TestModule, 'disabled'), "ThresholdCounter creation succeeded.");
    
    ok(typeof n.incrementLockedCounter === 'function', "An incrementLockedCounter function should exist.");
    ok(typeof n.decrementLockedCounter === 'function', "A decrementLockedCounter function should exist.");
    ok(typeof n.setLockedThreshold === 'function', "A setLockedThreshold function should exist.");
    
    ok(typeof n.incrementDisabledCounter === 'function', "An incrementDisabledCounter function should exist.");
    ok(typeof n.decrementDisabledCounter === 'function', "A decrementDisabledCounter function should exist.");
    ok(typeof n.setDisabledThreshold === 'function', "A setDisabledThreshold function should exist.");
    
    // Initialize the instance
    myt.ThresholdCounter.initializeThresholdCounter(n, 2, 3, 'locked');
    myt.ThresholdCounter.initializeThresholdCounter(n, 0, 1, 'disabled');
    
    ok(n.lockedCounter === 2, "Counter attribute should be set.");
    ok(n.lockedThreshold === 3, "Threshold attribute should be set.");
    ok(n.locked === false, "Locked should be false, was: " + n.locked);
    
    ok(n.disabledCounter === 0, "Counter attribute should be set.");
    ok(n.disabledThreshold === 1, "Threshold attribute should be set.");
    ok(n.disabled === false, "Disabled should be false, was: " + n.disabled);
    
    n.destroy();
});

test("Add fixed ThresholdCounter on an instance.", function() {
    var TestClass = new JS.Class('TestClass', myt.Node, {});
    
    var n = new TestClass();
    
    ok(myt.ThresholdCounter.createFixedThresholdCounter(n, 1, 'locked'), "ThresholdCounter creation succeeded.");
    
    ok(typeof n.incrementLockedCounter === 'function', "An incrementLockedCounter function should exist.");
    ok(typeof n.decrementLockedCounter === 'function', "A decrementLockedCounter function should exist.");
    
    // Initialize the instance
    myt.ThresholdCounter.initializeFixedThresholdCounter(n, 0, 1, 'locked');
    
    ok(n.lockedCounter === 0, "Counter attribute should be set.");
    ok(n.locked === false, "Locked should be false, was: " + n.locked);
    
    // Verify that an exceeded event fires
    var observer = new myt.Node(null, null, [{
        handleLockedEvent: function(e) {
            this.observedLocked = e.value;
        }
    }]);
    n.attachObserver(observer, 'handleLockedEvent', 'locked');
    ok(observer.observedLocked === undefined, "Observer should not have seen an event yet.");
    
    n.incrementLockedCounter();
    
    ok(n.lockedCounter === 1, "Counter should now be 3.");
    ok(n.locked === true, "Exceeded should now be true.");
    ok(observer.observedLocked === true, "Observer should have seen an event.");
    
    n.decrementLockedCounter();
    
    ok(n.lockedCounter === 0, "Counter should now be 2 since we decrement below threshold.");
    ok(n.locked === false, "Exceeded should now be false.");
    ok(observer.observedLocked === false, "Observer should have seen an event.");
    
    // Don't allow decrement below 0
    n.decrementLockedCounter();
    
    ok(n.lockedCounter === 0, "Counter should still be 0 but was: " + n.counter);
    
    // Test creation failure
    ok(myt.ThresholdCounter.createFixedThresholdCounter(n, 1, 'locked') === false, "Creation should fail when functions would be clobbered.");
    
    observer.destroy();
    n.destroy();
});
