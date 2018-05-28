module('Observable');

test("Attach and Remove event observers.", function() {
    var observable = new myt.Node();
    
    var observer = new myt.Node(null, null, [{
        handleFooEvent: function(e) {}
    }]);
    
    // No observers yet
    ok(observable.hasObservers('foo') === false, "Should have no 'foo' event observers yet.");
    ok(observable.getObservers('foo').length === 0, "Should have zero length 'foo' event observers array.");
    
    // Attach an observer and verify it's there
    ok(observable.attachObserver(observer, 'handleFooEvent', 'foo') === true, "Attach observer worked");
    
    ok(observable.attachObserver(null, 'handleFooEvent', 'foo') === false, "Attach observer should not work when observer is missing.");
    ok(observable.attachObserver(observer, '', 'foo') === false, "Attach observer should not work when method name is empty.");
    ok(observable.attachObserver(observer, 'handleFooEvent', '') === false, "Attach observer should not work when event type is missing.");
    
    ok(observable.hasObservers('foo') === true, "Should have 'foo' event observers now.");
    var fooObservers = observable.getObservers('foo');
    ok(fooObservers.length === 2, "Should have a 'foo' event array of length 2. Was length: " + fooObservers.length);
    ok(fooObservers[0] === 'handleFooEvent', "Method name should be first in observers array.");
    ok(fooObservers[1] === observer, "Observer object should be second in observers array.");
    
    // Remove observer and verify it's gone
    ok(observable.detachObserver(null, 'handleFooEvent', 'foo') === false, "Detach observer should not work when observer is missing.");
    ok(observable.detachObserver(observer, '', 'foo') === false, "Detach observer should not work when method name is empty.");
    ok(observable.detachObserver(observer, 'handleFooEvent', '') === false, "Detach observer should not work when event type is missing.");
    
    ok(observable.detachObserver(observer, 'handleFooEvent', 'foo') === true, "Detach observer worked");
    
    ok(observable.hasObservers('foo') === false, "After detach should have no 'foo' event observers now.");
    var fooObserversAgain = observable.getObservers('foo');
    ok(fooObserversAgain.length === 0, "Should have a 'foo' event array of length 0. Was length: " + fooObserversAgain.length);
    
    // Detach when nothing was ever added for an event
    ok(observable.detachObserver(observer, 'handleFooEvent', 'foo') === false, "Detach observer should return false when there's nothing to detach.");
    ok(observable.detachObserver(observer, 'handleFooEvent', 'nonexistant') === false, "Detach observer should return false when the event doesn't exist.");
    
    observable.destroy();
    observer.destroy();
});

test("Test detachAllObservers.", function() {
    var observable = new myt.Node();
    
    var observer = new myt.Node(null, null, [{
        handleFooEvent: function(e) {},
        handleBarEvent: function(e) {}
    }]);
    
    var otherObserver = new myt.Node(null, null, [{
        handleOtherFooEvent: function(e) {},
        handleOtherBarEvent: function(e) {}
    }]);
    
    observable.attachObserver(observer, 'handleFooEvent', 'foo');
    observable.attachObserver(observer, 'handleBarEvent', 'bar');
    observable.attachObserver(otherObserver, 'handleOtherFooEvent', 'foo');
    
    ok(observable.hasObservers('foo') === true, "Should have 'foo' event observers now.");
    ok(observable.hasObservers('bar') === true, "Should have 'bar' event observers now.");
    var fooObservers = observable.getObservers('foo');
    ok(fooObservers.length === 4, "Should have a 'foo' event array of length 4. Was length: " + fooObservers.length);
    var barObservers = observable.getObservers('bar');
    ok(barObservers.length === 2, "Should have a 'bar' event array of length 2. Was length: " + barObservers.length);
    
    observable.detachAllObservers();
    
    ok(observable.hasObservers('foo') === false, "Should have no 'foo' event observers now.");
    ok(observable.hasObservers('bar') === false, "Should have no 'bar' event observers now.");
    var fooObserversAgain = observable.getObservers('foo');
    ok(fooObservers.length === 0, "Should have a 'foo' event array of length 0. Was length: " + fooObserversAgain.length);
    
    observable.destroy();
    observer.destroy();
});

test("Node destruction should clean up observer for Observable.", function() {
    var observable = new myt.Node();
    
    var observer = new myt.Node(null, null, [{
        handleFooEvent: function(e) {},
        handleBarEvent: function(e) {}
    }]);
    
    var otherObserver = new myt.Node(null, null, [{
        handleOtherFooEvent: function(e) {},
        handleOtherBarEvent: function(e) {}
    }]);
    
    // No observers yet
    ok(observable.hasObservers('foo') === false, "Should have no 'foo' event observers yet.");
    ok(observable.hasObservers('bar') === false, "Should have no 'bar' event observers yet.");
    
    // Attach an observer and verify it's there
    observable.attachObserver(observer, 'handleFooEvent', 'foo');
    observable.attachObserver(observer, 'handleBarEvent', 'bar');
    
    ok(observable.hasObservers('foo') === true, "Should have 'foo' event observers now.");
    ok(observable.hasObservers('bar') === true, "Should have 'bar' event observers now.");
    
    var fooObservers = observable.getObservers('foo');
    ok(fooObservers.length === 2, "Should have a 'foo' event array of length 2. Was length: " + fooObservers.length);
    
    // Adding the same observer again is not prohibited
    observable.attachObserver(observer, 'handleFooEvent', 'foo');
    var fooObservers2 = observable.getObservers('foo');
    ok(fooObservers2.length === 4, "Should have a 'foo' event array of length 4. Was length: " + fooObservers2.length);
    ok(fooObservers2[0] === 'handleFooEvent', "Method name should be first in observers array.");
    ok(fooObservers2[1] === observer, "Observer object should be second in observers array.");
    ok(fooObservers2[2] === 'handleFooEvent', "Method name should be third in observers array.");
    ok(fooObservers2[3] === observer, "Observer object should be fourth in observers array.");
    
    // Adding another observer should work and it should be pushed onto the
    // end of the observer array.
    observable.attachObserver(otherObserver, 'handleOtherFooEvent', 'foo');
    var fooObservers3 = observable.getObservers('foo');
    ok(fooObservers3.length === 6, "Should have a 'foo' event array of length 6. Was length: " + fooObservers3.length);
    ok(fooObservers2[0] === 'handleFooEvent', "Method name should be first in observers array.");
    ok(fooObservers2[1] === observer, "Observer object should be second in observers array.");
    ok(fooObservers2[2] === 'handleFooEvent', "Method name should be third in observers array.");
    ok(fooObservers2[3] === observer, "Observer object should be fourth in observers array.");
    ok(fooObservers2[4] === 'handleOtherFooEvent', "Method name for new observer should be fifth in observers array.");
    ok(fooObservers2[5] === otherObserver, "New observer object should be sixth in observers array.");
    
    observable.destroy();
    
    ok(observable.hasObservers('foo') === false, "Should have no 'foo' event observers now.");
    ok(observable.hasObservers('bar') === false, "Should have no 'bar' event observers now.");
    var fooObserversAgain = observable.getObservers('foo');
    ok(fooObserversAgain.length === 0, "Should have a 'foo' event array of length 0. Was length: " + fooObserversAgain.length);
    
    observer.destroy();
    otherObserver.destroy();
});

test("Fire an event.", function() {
    var observable = new myt.Node();
    
    var observer = new myt.Node(null, null, [{
        doBeforeAdoption: function() {
            this.fooEventCount = 0;
            this.lastFooEvent = null;
        },
        
        handleFooEvent: function(e) {
            this.fooEventCount++;
            this.lastFooEvent = e;
        }
    }]);
    
    // Fire event once before attachment just to make sure the observer
    // is not somehow registered or being notified on attach.
    observable.fireEvent('foo', 'bar');
    
    ok(observer.fooEventCount === 0, "Ensure observer initialization of fooEventCount was correct.");
    ok(observer.lastFooEvent === null, "Ensure observer initialization lastFooEvent was correct.");
    
    observable.attachObserver(observer, 'handleFooEvent', 'foo');
    observable.fireEvent('foo', 'bar');
    
    ok(observer.fooEventCount === 1, "One event should have been fired.");
    ok(observer.lastFooEvent != null, "Last foo event should exist now.");
    ok(observer.lastFooEvent.source === observable, "Source of event should be observable Node.");
    ok(observer.lastFooEvent.type === 'foo', "Type of event should be 'foo'.");
    ok(observer.lastFooEvent.value === 'bar', "Value of event should be 'bar'.");
    
    observable.destroy();
    observer.destroy();
});

test("Verify infinite event loop protection.", function() {
    var n1 = new myt.Node(null, null, [{
        doBeforeAdoption: function() {
            this.fooEventCount = 0;
            this.lastFooEvent = null;
        },
        
        handleFooEvent: function(e) {
            this.fooEventCount++;
            this.lastFooEvent = e;
            
            this.fireEvent('foo','bar');
        }
    }]);
    
    var n2 = new myt.Node(null, null, [{
        doBeforeAdoption: function() {
            this.fooEventCount = 0;
            this.lastFooEvent = null;
            this.eventLoopFiredCount = 0;
            
            this.attachTo(myt.global.error, 'handleEventLoop', 'eventLoop');
        },
        
        handleFooEvent: function(e) {
            this.fooEventCount++;
            this.lastFooEvent = e;
            
            this.fireEvent('foo','bar');
        },
        
        handleEventLoop: function(e) {
            if (e.type === 'eventLoop') this.eventLoopFiredCount++;
        }
    }]);
    
    // Cross register them
    n1.attachObserver(n2, 'handleFooEvent', 'foo');
    n2.attachObserver(n1, 'handleFooEvent', 'foo');
    
    ok(n1.fooEventCount === 0, "Ensure observer initialization of fooEventCount was correct.");
    ok(n1.lastFooEvent === null, "Ensure observer initialization lastFooEvent was correct.");
    ok(n2.fooEventCount === 0, "Ensure observer initialization of fooEventCount was correct.");
    ok(n2.lastFooEvent === null, "Ensure observer initialization lastFooEvent was correct.");
    
    // Fire an event to trigger the loop
    n1.fireEvent('foo', 'bar');
    
    ok(n1.fooEventCount === 1, "One event should have been fired.");
    ok(n2.fooEventCount === 1, "One event should have been fired.");
    ok(n2.eventLoopFiredCount === 1, "One eventLoop error event should have been fired.");
    
    n1.destroy();
    n2.destroy();
});

test("Fire an event to a specific list of observers.", function() {
    var observable = new myt.Node();
    
    var observer1 = new myt.Node(null, null, [{
        doBeforeAdoption: function() {
            this.fooEventCount = 0;
            this.lastFooEvent = null;
        },
        
        handleFooEvent: function(e) {
            this.fooEventCount++;
            this.lastFooEvent = e;
        }
    }]);
    
    var observer2 = new myt.Node(null, null, [{
        doBeforeAdoption: function() {
            this.fooEventCount = 0;
            this.lastFooEvent = null;
        },
        
        handleFooEvent: function(e) {
            this.fooEventCount++;
            this.lastFooEvent = e;
        }
    }]);
    
    // Attach first observer only
    observable.attachObserver(observer1, 'handleFooEvent', 'foo');
    
    ok(observer1.fooEventCount === 0, "Ensure observer initialization of fooEventCount was correct.");
    ok(observer1.lastFooEvent === null, "Ensure observer initialization lastFooEvent was correct.");
    ok(observer2.fooEventCount === 0, "Ensure observer initialization of fooEventCount was correct.");
    ok(observer2.lastFooEvent === null, "Ensure observer initialization lastFooEvent was correct.");
    
    // Fire an event
    observable.fireEvent('foo', 'bar');
    ok(observer1.fooEventCount === 1, "One event should have been fired to observer 1.");
    ok(observer2.fooEventCount === 0, "No event should have been fired to observer 2.");
    
    // Fire again to specific list
    observable.fireEvent('foo', 'bar', ['handleFooEvent', observer2]);
    ok(observer1.fooEventCount === 1, "No event should have been fired to observer 1.");
    ok(observer2.fooEventCount === 1, "One event should have been fired to observer 2.");
    
    observable.destroy();
    observer1.destroy();
    observer2.destroy();
});

test("Attach and Remove event observers where methodNames are functions.", function() {
    var observable = new myt.Node();
    
    var observer = new myt.Node(null, null, [{
        handleFooEvent: function(e) {}
    }]);
    
    var funcHandleFoo = function(event) {
        this.handleFooEvent(event);
    };
    
    // No observers yet
    ok(observable.hasObservers('foo') === false, "Should have no 'foo' event observers yet.");
    ok(observable.getObservers('foo').length === 0, "Should have zero length 'foo' event observers array.");
    
    // Attach an observer and verify it's there
    ok(observable.attachObserver(observer, funcHandleFoo, 'foo') === true, "Attach observer worked");
    
    ok(observable.attachObserver(null, funcHandleFoo, 'foo') === false, "Attach observer should not work when observer is missing.");
    ok(observable.attachObserver(observer, '', 'foo') === false, "Attach observer should not work when method name is empty.");
    ok(observable.attachObserver(observer, funcHandleFoo, '') === false, "Attach observer should not work when event type is missing.");
    
    ok(observable.hasObservers('foo') === true, "Should have 'foo' event observers now.");
    var fooObservers = observable.getObservers('foo');
    ok(fooObservers.length === 2, "Should have a 'foo' event array of length 2. Was length: " + fooObservers.length);
    ok(fooObservers[0] === funcHandleFoo, "Method name should be first in observers array.");
    ok(fooObservers[1] === observer, "Observer object should be second in observers array.");
    
    // Remove observer and verify it's gone
    ok(observable.detachObserver(null, funcHandleFoo, 'foo') === false, "Detach observer should not work when observer is missing.");
    ok(observable.detachObserver(observer, '', 'foo') === false, "Detach observer should not work when method name is empty.");
    ok(observable.detachObserver(observer, funcHandleFoo, '') === false, "Detach observer should not work when event type is missing.");
    
    ok(observable.detachObserver(observer, funcHandleFoo, 'foo') === true, "Detach observer worked");
    
    ok(observable.hasObservers('foo') === false, "After detach should have no 'foo' event observers now.");
    var fooObserversAgain = observable.getObservers('foo');
    ok(fooObserversAgain.length === 0, "Should have a 'foo' event array of length 0. Was length: " + fooObserversAgain.length);
    
    // Detach when nothing was ever added for an event
    ok(observable.detachObserver(observer, funcHandleFoo, 'foo') === false, "Detach observer should return false when there's nothing to detach.");
    ok(observable.detachObserver(observer, funcHandleFoo, 'nonexistant') === false, "Detach observer should return false when the event doesn't exist.");
    
    observable.destroy();
    observer.destroy();
});

test("Provide a function instead of a method name", function() {
    var observable = new myt.Node();
    var observable2 = new myt.Node();
    
    var observer = new myt.Node(null, null, [{
        doBeforeAdoption: function() {
            this.fooEventCount = 0;
            this.lastFooEvent = null;
        },
        
        handleFooEvent: function(e) {
            this.fooEventCount++;
            this.lastFooEvent = e;
        }
    }]);
    
    var funcHandleFoo = function(event) {
        this.handleFooEvent(event);
    };
    
    ok(observer.fooEventCount === 0, "Ensure observer initialization of fooEventCount was correct.");
    ok(observer.lastFooEvent === null, "Ensure observer initialization lastFooEvent was correct.");
    
    // Use a function that wraps another function
    observable.attachObserver(observer, funcHandleFoo, 'foo');
    
    // Attach to a second observable and fire an event on that observable
    observable2.attachObserver(observer, observer.handleFooEvent, 'foo');
    observable2.fireEvent('foo', 'bar');
    
    ok(observer.fooEventCount === 1, "Two events should have been fired.");
    ok(observer.lastFooEvent.source === observable2, "Source of event should be observable2 Node.");
    ok(observer.lastFooEvent.type === 'foo', "Type of event should be 'foo'.");
    ok(observer.lastFooEvent.value === 'bar', "Value of event should be 'bar'.");
    
    observable.destroy();
    observable2.destroy();
    observer.destroy();
});
