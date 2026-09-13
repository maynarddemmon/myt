module('Observable');

test("Attach and Remove event observers.", function() {
    const observable = new myt.Node(),
        observer = new myt.Node(null, null, [{
            handleFooEvent: function(_e) {}
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
    const fooObserversAgain = observable.getObservers('foo');
    ok(fooObserversAgain.length === 0, "Should have a 'foo' event array of length 0. Was length: " + fooObserversAgain.length);
    
    // Detach when nothing was ever added for an event
    ok(observable.detachObserver(observer, 'handleFooEvent', 'foo') === false, "Detach observer should return false when there's nothing to detach.");
    ok(observable.detachObserver(observer, 'handleFooEvent', 'nonexistant') === false, "Detach observer should return false when the event doesn't exist.");
    
    observable.destroy();
    observer.destroy();
});

test("Test detachAllObservers.", function() {
    const observable = new myt.Node(),
        observer = new myt.Node(null, null, [{
            handleFooEvent: function(_e) {},
            handleBarEvent: function(_e) {}
        }]),
        otherObserver = new myt.Node(null, null, [{
            handleOtherFooEvent: function(_e) {},
            handleOtherBarEvent: function(_e) {}
        }]);
    
    observable.attachObserver(observer, 'handleFooEvent', 'foo');
    observable.attachObserver(observer, 'handleBarEvent', 'bar');
    observable.attachObserver(otherObserver, 'handleOtherFooEvent', 'foo');
    
    ok(observable.hasObservers('foo') === true, "Should have 'foo' event observers now.");
    ok(observable.hasObservers('bar') === true, "Should have 'bar' event observers now.");
    const fooObservers = observable.getObservers('foo');
    ok(fooObservers.length === 4, "Should have a 'foo' event array of length 4. Was length: " + fooObservers.length);
    const barObservers = observable.getObservers('bar');
    ok(barObservers.length === 2, "Should have a 'bar' event array of length 2. Was length: " + barObservers.length);
    
    observable.detachAllObservers();
    
    ok(observable.hasObservers('foo') === false, "Should have no 'foo' event observers now.");
    ok(observable.hasObservers('bar') === false, "Should have no 'bar' event observers now.");
    const fooObserversAgain = observable.getObservers('foo');
    ok(fooObservers.length === 0, "Should have a 'foo' event array of length 0. Was length: " + fooObserversAgain.length);
    
    observable.destroy();
    observer.destroy();
});

test("Node destruction should clean up observer for Observable.", function() {
    const observable = new myt.Node(),
        observer = new myt.Node(null, null, [{
            handleFooEvent: function(_e) {},
            handleBarEvent: function(_e) {}
        }]),
        otherObserver = new myt.Node(null, null, [{
            handleOtherFooEvent: function(_e) {},
            handleOtherBarEvent: function(_e) {}
        }]);
    
    // No observers yet
    ok(observable.hasObservers('foo') === false, "Should have no 'foo' event observers yet.");
    ok(observable.hasObservers('bar') === false, "Should have no 'bar' event observers yet.");
    
    // Attach an observer and verify it's there
    observable.attachObserver(observer, 'handleFooEvent', 'foo');
    observable.attachObserver(observer, 'handleBarEvent', 'bar');
    
    ok(observable.hasObservers('foo') === true, "Should have 'foo' event observers now.");
    ok(observable.hasObservers('bar') === true, "Should have 'bar' event observers now.");
    
    const fooObservers = observable.getObservers('foo');
    ok(fooObservers.length === 2, "Should have a 'foo' event array of length 2. Was length: " + fooObservers.length);
    
    // Adding the same observer again is not prohibited
    observable.attachObserver(observer, 'handleFooEvent', 'foo');
    const fooObservers2 = observable.getObservers('foo');
    ok(fooObservers2.length === 4, "Should have a 'foo' event array of length 4. Was length: " + fooObservers2.length);
    ok(fooObservers2[0] === 'handleFooEvent', "Method name should be first in observers array.");
    ok(fooObservers2[1] === observer, "Observer object should be second in observers array.");
    ok(fooObservers2[2] === 'handleFooEvent', "Method name should be third in observers array.");
    ok(fooObservers2[3] === observer, "Observer object should be fourth in observers array.");
    
    // Adding another observer should work and it should be pushed onto the
    // end of the observer array.
    observable.attachObserver(otherObserver, 'handleOtherFooEvent', 'foo');
    const fooObservers3 = observable.getObservers('foo');
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
    const fooObserversAgain = observable.getObservers('foo');
    ok(fooObserversAgain.length === 0, "Should have a 'foo' event array of length 0. Was length: " + fooObserversAgain.length);
    
    observer.destroy();
    otherObserver.destroy();
});

test("Fire an event.", function() {
    const observable = new myt.Node(),
        observer = new myt.Node(null, null, [{
            initNode: function(parent, attrs) {
                this.fooEventCount = 0;
                this.lastFooEvent = null;
                
                this.callSuper(parent, attrs);
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
    const n1 = new myt.Node(null, null, [{
            initNode: function(parent, attrs) {
                this.fooEventCount = 0;
                this.lastFooEvent = null;
                
                this.callSuper(parent, attrs);
            },
            
            handleFooEvent: function(e) {
                this.fooEventCount++;
                this.lastFooEvent = e;
                
                this.fireEvent('foo','bar');
            }
        }]),
        n2 = new myt.Node(null, null, [{
            initNode: function(parent, attrs) {
                this.fooEventCount = 0;
                this.lastFooEvent = null;
                this.eventLoopFiredCount = 0;
                
                this.attachTo(myt.global.error, 'handleEventLoop', 'eventLoop');
                
                this.callSuper(parent, attrs);
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
    const observable = new myt.Node(),
        observer1 = new myt.Node(null, null, [{
            initNode: function(parent, attrs) {
                this.fooEventCount = 0;
                this.lastFooEvent = null;
                
                this.callSuper(parent, attrs);
            },
            
            handleFooEvent: function(e) {
                this.fooEventCount++;
                this.lastFooEvent = e;
            }
        }]),
        observer2 = new myt.Node(null, null, [{
            initNode: function(parent, attrs) {
                this.fooEventCount = 0;
                this.lastFooEvent = null;
                
                this.callSuper(parent, attrs);
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
    const observable = new myt.Node(),
        observer = new myt.Node(null, null, [{
            handleFooEvent: function(_e) {}
        }]),
        funcHandleFoo = function(event) {
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
    const fooObservers = observable.getObservers('foo');
    ok(fooObservers.length === 2, "Should have a 'foo' event array of length 2. Was length: " + fooObservers.length);
    ok(fooObservers[0] === funcHandleFoo, "Method name should be first in observers array.");
    ok(fooObservers[1] === observer, "Observer object should be second in observers array.");
    
    // Remove observer and verify it's gone
    ok(observable.detachObserver(null, funcHandleFoo, 'foo') === false, "Detach observer should not work when observer is missing.");
    ok(observable.detachObserver(observer, '', 'foo') === false, "Detach observer should not work when method name is empty.");
    ok(observable.detachObserver(observer, funcHandleFoo, '') === false, "Detach observer should not work when event type is missing.");
    
    ok(observable.detachObserver(observer, funcHandleFoo, 'foo') === true, "Detach observer worked");
    
    ok(observable.hasObservers('foo') === false, "After detach should have no 'foo' event observers now.");
    const fooObserversAgain = observable.getObservers('foo');
    ok(fooObserversAgain.length === 0, "Should have a 'foo' event array of length 0. Was length: " + fooObserversAgain.length);
    
    // Detach when nothing was ever added for an event
    ok(observable.detachObserver(observer, funcHandleFoo, 'foo') === false, "Detach observer should return false when there's nothing to detach.");
    ok(observable.detachObserver(observer, funcHandleFoo, 'nonexistant') === false, "Detach observer should return false when the event doesn't exist.");
    
    observable.destroy();
    observer.destroy();
});

test("Provide a function instead of a method name", function() {
    const observable = new myt.Node(),
        observable2 = new myt.Node(),
        observer = new myt.Node(null, null, [{
            initNode: function(parent, attrs) {
                this.fooEventCount = 0;
                this.lastFooEvent = null;
                
                this.callSuper(parent, attrs);
            },
            
            handleFooEvent: function(e) {
                this.fooEventCount++;
                this.lastFooEvent = e;
            }
        }]),
        funcHandleFoo = function(event) {
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

test("getAllObservers with no attachments returns an empty Set.", function() {
    const observable = new myt.Node();
    
    ok(observable.getAllObservers().size === 0, "A fresh Observable has no observers.");
    
    observable.destroy();
});

test("getAllObservers collects observers across event types.", function() {
    const observable = new myt.Node(),
        obsA = new myt.Node(null, null, [{onFoo:function() {}}]),
        obsB = new myt.Node(null, null, [{onBar:function() {}}]);
    
    observable.attachObserver(obsA, 'onFoo', 'foo');
    observable.attachObserver(obsB, 'onBar', 'bar');
    observable.attachObserver(obsA, 'onFoo', 'baz'); // Same observer, a second event type.
    
    const all = observable.getAllObservers();
    ok(all.size === 2, "The Set dedupes obsA even though it is attached for two event types. Size: " + all.size);
    ok(all.has(obsA), "obsA is included.");
    ok(all.has(obsB), "obsB is included.");
    
    observable.destroy();
    obsA.destroy();
    obsB.destroy();
});

test("getAllObservers with an Array accumulator keeps one entry per attachment.", function() {
    const observable = new myt.Node(),
        obsA = new myt.Node(null, null, [{onFoo:function() {}}]);
    
    observable.attachObserver(obsA, 'onFoo', 'foo');
    observable.attachObserver(obsA, 'onFoo', 'baz');
    
    const asArray = observable.getAllObservers(null, []);
    ok(asArray.length === 2, "An Array accumulator has one entry per attachment, not per unique observer. Length: " + asArray.length);
    ok(asArray[0] === obsA && asArray[1] === obsA, "Both entries are the same observer.");
    
    observable.destroy();
    obsA.destroy();
});

test("getAllObservers passes filterFunc the observer, methodName and eventType.", function() {
    const observable = new myt.Node(),
        obsA = new myt.Node(null, null, [{onFoo:function() {}}]),
        seen = [];
    
    observable.attachObserver(obsA, 'onFoo', 'foo');
    observable.getAllObservers(function(observer, methodName, eventType) {
        seen.push(observer === obsA ? 'obsA' : 'other', methodName, eventType);
        return true;
    });
    
    deepEqual(seen, ['obsA', 'onFoo', 'foo'], "filterFunc received the arguments in the documented order.");
    
    observable.destroy();
    obsA.destroy();
});

test("getAllObservers only includes attachments the filterFunc approves.", function() {
    const observable = new myt.Node(),
        obsA = new myt.Node(null, null, [{onFoo:function() {}}]),
        obsB = new myt.Node(null, null, [{onBar:function() {}}]);
    
    observable.attachObserver(obsA, 'onFoo', 'foo');
    observable.attachObserver(obsB, 'onBar', 'bar');
    
    const onlyB = observable.getAllObservers(function(observer) {return observer === obsB;});
    ok(onlyB.has(obsA) === false, "obsA was filtered out.");
    ok(onlyB.has(obsB) === true, "obsB was kept.");
    
    observable.destroy();
    obsA.destroy();
    obsB.destroy();
});

test("getAllObservers reflects detachObserver and detachAllObservers.", function() {
    const observable = new myt.Node(),
        obsA = new myt.Node(null, null, [{onFoo:function() {}}]),
        obsB = new myt.Node(null, null, [{onBar:function() {}}]);
    
    observable.attachObserver(obsA, 'onFoo', 'foo');
    observable.attachObserver(obsA, 'onFoo', 'baz');
    observable.attachObserver(obsB, 'onBar', 'bar');
    
    observable.detachObserver(obsA, 'onFoo', 'foo');
    const afterOneDetach = observable.getAllObservers();
    ok(afterOneDetach.has(obsA), "obsA is still attached via the 'baz' event type.");
    ok(afterOneDetach.has(obsB), "obsB is unaffected.");
    
    observable.detachAllObservers();
    ok(observable.getAllObservers().size === 0, "detachAllObservers empties the result.");
    
    observable.destroy();
    obsA.destroy();
    obsB.destroy();
});
