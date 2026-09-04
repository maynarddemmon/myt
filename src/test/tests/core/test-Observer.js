module('Observer');

test("Attach and Remove event observers.", function() {
    var observable = new myt.Node();
    
    var observer = new myt.Node(null, null, [{
        handleFooEvent: function(_e) {}
    }]);
    
    // No observers yet
    ok(observable.hasObservers('foo') === false, "Source should have no 'foo' event observers yet.");
    ok(observable.getObservers('foo').length === 0, "Source should have zero length 'foo' event observers array.");
    
    ok(observer.hasObservables('foo') === false, "Observer should have no 'foo' event observables yet.");
    ok(observer.getObservables('foo').length === 0, "Observer should have zero length 'foo' observables array.");
    
    ok(observer.isAttachedTo(observable, 'handleFooEvent', 'foo') === false, "Observer should not be attached yet.");
    
    // Attach to an observable and verify it's there
    ok(observer.attachTo(observable, 'handleFooEvent', 'foo') === true, "Attach to observable worked");
    
    ok(observer.isAttachedTo(observable, 'handleFooEvent', 'foo') === true, "Observer should now be attached.");
    
    ok(observer.attachTo(null, 'handleFooEvent', 'foo') === false, "Attach to observable should not work when observable is missing.");
    ok(observer.attachTo(observable, '', 'foo') === false, "Attach to observable should not work when method name is empty.");
    ok(observer.attachTo(observable, 'handleFooEvent', '') === false, "Attach to observable should not work when event type is missing.");
    
    ok(observable.hasObservers('foo') === true, "Source should have 'foo' observers now.");
    ok(observer.hasObservables('foo') === true, "Observer should have 'foo' observables now.");
    
    var fooObservers = observable.getObservers('foo');
    ok(fooObservers.length === 2, "Source should have a 'foo' event array of length 2. Was length: " + fooObservers.length);
    ok(fooObservers[0] === 'handleFooEvent', "Method name should be first in observers array.");
    ok(fooObservers[1] === observer, "Observer object should be second in observers array.");
    
    var fooSources = observer.getObservables('foo');
    ok(fooSources.length === 2, "Should have a 'foo' event array of length 2. Was length: " + fooSources.length);
    ok(fooSources[0] === 'handleFooEvent', "Method name should be first in observables array.");
    ok(fooSources[1] === observable, "Observer object should be second in observables array.");
    
    // Remove observable and verify it's gone
    ok(observer.detachFrom(null, 'handleFooEvent', 'foo') === false, "Detach from observable should not work when observable is missing.");
    ok(observer.detachFrom(observable, '', 'foo') === false, "Detach from observable should not work when method name is empty.");
    ok(observer.detachFrom(observable, 'handleFooEvent', '') === false, "Detach from observable should not work when event type is missing.");
    
    ok(observer.detachFrom(observable, 'handleFooEvent', 'foo') === true, "Detach from observable worked");
    
    ok(observable.hasObservers('foo') === false, "After detach should have no 'foo' observers now.");
    var fooObserversAgain = observable.getObservers('foo');
    ok(fooObserversAgain.length === 0, "Should have a 'foo' event array of length 0. Was length: " + fooObserversAgain.length);
    
    ok(observer.hasObservables('foo') === false, "After detach should have no 'foo' observables now.");
    var fooSourcesAgain = observer.getObservables('foo');
    ok(fooSourcesAgain.length === 0, "Should have a 'foo' event array of length 0. Was length: " + fooSourcesAgain.length);
    
    // Detach when nothing was ever added for an event
    ok(observable.detachObserver(observer, 'handleFooEvent', 'foo') === false, "Detach observer should return false when there's nothing to detach.");
    ok(observable.detachObserver(observer, 'handleFooEvent', 'nonexistant') === false, "Detach observer should return false when the event doesn't exist.");
    
    ok(observer.detachFrom(observable, 'handleFooEvent', 'foo') === false, "Detach from observable should return false when there's nothing to detach.");
    ok(observer.detachFrom(observable, 'handleFooEvent', 'nonexistant') === false, "Detach from observable should return false when the event doesn't exist.");
    
    observable.destroy();
    observer.destroy();
});

test("Test detachFromAllObservables.", function() {
    var observable = new myt.Node();
    var otherSource = new myt.Node();
    
    var observer = new myt.Node(null, null, [{
        handleFooEvent: function(_e) {},
        handleBarEvent: function(_e) {}
    }]);
    
    observer.attachTo(observable, 'handleFooEvent', 'foo');
    observer.attachTo(observable, 'handleBarEvent', 'bar');
    observer.attachTo(otherSource, 'handleFooEvent', 'foo');
    
    ok(observer.hasObservables('foo') === true, "Observer should have 'foo' observables now.");
    ok(observer.hasObservables('bar') === true, "Observer should have 'bar' observables now.");
    
    var fooSources = observer.getObservables('foo');
    ok(fooSources.length === 4, "Should have a 'foo' event array of length 4. Was length: " + fooSources.length);
    var barSources = observer.getObservables('bar');
    ok(barSources.length === 2, "Should have a 'bar' event array of length 2. Was length: " + barSources.length);
    
    observer.detachFromAllObservables();
    
    ok(observer.hasObservables('foo') === false, "Observer should have no 'foo' observables now.");
    ok(observer.hasObservables('bar') === false, "Observer should have no 'bar' observables now.");
    var fooSourcesAgain = observer.getObservables('foo');
    ok(fooSourcesAgain.length === 0, "Should have a 'foo' event array of length 0. Was length: " + fooSourcesAgain.length);
    
    observable.destroy();
    observer.destroy();
});

test("Node destruction should clean up observables for Observer.", function() {
    var observable = new myt.Node();
    var otherSource = new myt.Node();
    
    var observer = new myt.Node(null, null, [{
        handleFooEvent: function(_e) {},
        handleBarEvent: function(_e) {}
    }]);
    
    // No observers yet
    ok(observable.hasObservers('foo') === false, "Source should have no 'foo' event observers yet.");
    ok(observable.getObservers('foo').length === 0, "Source should have zero length 'foo' event observers array.");
    
    ok(observer.hasObservables('foo') === false, "Observer should have no 'foo' observables yet.");
    ok(observer.getObservables('foo').length === 0, "Observer should have zero length 'foo' observables array.");
    
    // Attach an observer and verify it's there
    observer.attachTo(observable, 'handleFooEvent', 'foo');
    observer.attachTo(observable, 'handleBarEvent', 'bar');
    observer.attachTo(otherSource, 'handleFooEvent', 'foo');
    
    ok(observer.hasObservables('foo') === true, "Observer should have 'foo' observables now.");
    ok(observer.hasObservables('bar') === true, "Observer should have 'bar' observables now.");
    
    var fooSources = observer.getObservables('foo');
    ok(fooSources.length === 4, "Should have a 'foo' event array of length 4. Was length: " + fooSources.length);
    var barSources = observer.getObservables('bar');
    ok(barSources.length === 2, "Should have a 'bar' event array of length 2. Was length: " + barSources.length);
    
    // Adding the same observable again is not prohibited
    observer.attachTo(observable, 'handleFooEvent', 'foo');
    var fooSources2 = observer.getObservables('foo');
    ok(fooSources2.length === 6, "Should have a 'foo' event array of length 4. Was length: " + fooSources2.length);
    ok(fooSources2[0] === 'handleFooEvent', "Method name should be first in observables array.");
    ok(fooSources2[1] === observable, "Observer object should be second in observables array.");
    ok(fooSources2[2] === 'handleFooEvent', "Method name should be third in observables array.");
    ok(fooSources2[3] === otherSource, "Observer object should be fourth in observables array.");
    ok(fooSources2[4] === 'handleFooEvent', "Method name should be fifth in observables array.");
    ok(fooSources2[5] === observable, "Observer object should be sixth in observables array.");
    
    observer.destroy();
    
    ok(observer.hasObservables('foo') === false, "Should have no 'foo' observables now.");
    ok(observer.hasObservables('bar') === false, "Should have no 'bar' observables now.");
    ok(observable.hasObservers('foo') === false, "Source should have no 'foo' observers now.");
    ok(observable.hasObservers('bar') === false, "Source should have no 'bar' observers now.");
    var fooSourcesAgain = observer.getObservables('foo');
    ok(fooSourcesAgain.length === 0, "Should have a 'foo' event array of length 0. Was length: " + fooSourcesAgain.length);
    
    observable.destroy();
    otherSource.destroy();
});

test("Fire an event after observer has attached.", function() {
    var observable = new myt.Node();
    
    var observer = new myt.Node(null, null, [{
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
    
    observer.attachTo(observable, 'handleFooEvent', 'foo');
    observable.fireEvent('foo', 'bar');
    
    ok(observer.fooEventCount === 1, "One event should have been fired.");
    ok(observer.lastFooEvent != null, "Last foo event should exist now.");
    ok(observer.lastFooEvent.source === observable, "Source of event should be observable Node.");
    ok(observer.lastFooEvent.type === 'foo', "Type of event should be 'foo'.");
    ok(observer.lastFooEvent.value === 'bar', "Value of event should be 'bar'.");
    
    observable.destroy();
    observer.destroy();
});

test("Attach once.", function() {
    var observable = new myt.Node();
    
    var observer = new myt.Node(null, null, [{
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
    
    ok(observer.isAttachedTo(observable, 'handleFooEvent', 'foo') === false, "Observer should not be attached yet.");
    ok(observer.isAttachedTo(observable, '__DO_ONCE_0', 'foo') === false, "Observer should not be attached yet.");
    
    ok(observer.__methodNameCounter === undefined, "Method name counter should start as undefined.");
    
    observer.attachTo(observable, 'handleFooEvent', 'foo', true);
    
    ok(observer.__methodNameCounter === 1, "Method name counter should now be 1.");
    ok(observer.isAttachedTo(observable, 'handleFooEvent', 'foo') === false, "Observer should still no be attached to handleFooEvent.");
    ok(observer.isAttachedTo(observable, '__DO_ONCE_0', 'foo') === true, "Observer should now be attached to __DO_ONCE_0.");
    
    observable.fireEvent('foo', 'bar');
    
    ok(observer.isAttachedTo(observable, 'handleFooEvent', 'foo') === false, "Observer should still no be attached to handleFooEvent.");
    ok(observer.isAttachedTo(observable, '__DO_ONCE_0', 'foo') === false, "Observer should no longer be attached to __DO_ONCE_0.");
    
    ok(observer.fooEventCount === 1, "One event should have been fired.");
    ok(observer.lastFooEvent != null, "Last foo event should exist now.");
    
    // Attach again
    observer.attachTo(observable, 'handleFooEvent', 'foo', true);
    
    ok(observer.__methodNameCounter === 2, "Method name counter should now be 1.");
    ok(observer.isAttachedTo(observable, 'handleFooEvent', 'foo') === false, "Observer should still no be attached to handleFooEvent.");
    ok(observer.isAttachedTo(observable, '__DO_ONCE_1', 'foo') === true, "Observer should now be attached to __DO_ONCE_1.");
    
    observable.fireEvent('foo', 'bar');
    
    ok(observer.isAttachedTo(observable, 'handleFooEvent', 'foo') === false, "Observer should still no be attached to handleFooEvent.");
    ok(observer.isAttachedTo(observable, '__DO_ONCE_1', 'foo') === false, "Observer should no longer be attached to __DO_ONCE_1.");
    
    observable.destroy();
    observer.destroy();
});

test("Constrain attaches to every observable and syncs once, then detach from every observable.", function() {
    var observableA = new myt.Node(),
        observableB = new myt.Node(),
        count = 0;
    
    var observer = new myt.Node(null, null, [{
        updateIt: function() {count++;}
    }]);
    
    observer.constrain('updateIt', [observableA, 'foo', observableB, 'bar']);
    
    ok(count === 1, "Constrain should call the method once to sync. Was: " + count);
    ok(observer.isAttachedTo(observableA, 'updateIt', 'foo') === true, "Should be attached to the first observable.");
    ok(observer.isAttachedTo(observableB, 'updateIt', 'bar') === true, "Should be attached to the second observable.");
    
    count = 0;
    observableA.fireEvent('foo', 1);
    ok(count === 1, "Firing the first observable should run the constraint method once. Was: " + count);
    
    observableB.fireEvent('bar', 1);
    ok(count === 2, "Firing the second observable should run the constraint method again. Was: " + count);
    
    // Now test release
    observer.releaseConstraint('updateIt');
    
    ok(observer.isAttachedTo(observableA, 'updateIt', 'foo') === false, "Should be detached from the first observable.");
    ok(observer.isAttachedTo(observableB, 'updateIt', 'bar') === false, "Should be detached from the second observable.");
    
    ok(observableA.hasObservers('foo') === false, "The first observable should have no observers left.");
    ok(observableB.hasObservers('bar') === false, "The second observable should have no observers left.");
    
    count = 0;
    observableA.fireEvent('foo', 1);
    observableB.fireEvent('bar', 1);
    ok(count === 0, "A released constraint should not run when the observables fire. Ran " + count + " times.");
});

test("Re-constraining after a release does not double attach.", function() {
    var observable = new myt.Node(),
        count = 0;
    
    var observer = new myt.Node(null, null, [{
        updateIt: function() {count++;}
    }]);
    
    observer.constrain('updateIt', [observable, 'foo']);
    observer.releaseConstraint('updateIt');
    observer.constrain('updateIt', [observable, 'foo']);
    
    count = 0;
    observable.fireEvent('foo', 1);
    ok(count === 1, "The constraint method should run exactly once per event, not once per stale attachment. Ran " + count + " times.");
    
    var observers = observable.getObservers('foo');
    ok(observers.length === 2, "The observable should hold exactly one observer entry. Array length was: " + observers.length);
});

test("Releasing all constraints detaches every one of them.", function() {
    var observableA = new myt.Node(),
        observableB = new myt.Node(),
        countOne = 0,
        countTwo = 0;
    
    var observer = new myt.Node(null, null, [{
        updateOne: function() {countOne++;},
        updateTwo: function() {countTwo++;}
    }]);
    
    observer.constrain('updateOne', [observableA, 'foo']);
    observer.constrain('updateTwo', [observableB, 'bar']);
    
    observer.releaseAllConstraints();
    
    ok(observer.isAttachedTo(observableA, 'updateOne', 'foo') === false, "The first constraint should be detached.");
    ok(observer.isAttachedTo(observableB, 'updateTwo', 'bar') === false, "The second constraint should be detached.");
    
    countOne = countTwo = 0;
    observableA.fireEvent('foo', 1);
    observableB.fireEvent('bar', 1);
    ok(countOne === 0, "The first constraint method should not run. Ran " + countOne + " times.");
    ok(countTwo === 0, "The second constraint method should not run. Ran " + countTwo + " times.");
});

test("Constrain rejects bad input and refuses to clobber.", function() {
    var observable = new myt.Node(),
        count = 0;
    
    var observer = new myt.Node(null, null, [{
        updateIt: function() {count++;}
    }]);
    
    // An uneven observables array is rejected outright.
    observer.constrain('updateIt', [observable, 'foo', observable]);
    ok(count === 0, "An uneven observables array should not sync the method. Was: " + count);
    ok(observer.isAttachedTo(observable, 'updateIt', 'foo') === false, "An uneven observables array should not attach.");
    
    // A missing method name or observables array is a no-op.
    observer.constrain('', [observable, 'foo']);
    observer.constrain('updateIt', null);
    ok(count === 0, "Constrain with missing arguments should do nothing. Was: " + count);
    
    // A second constrain for the same method is refused rather than clobbering.
    observer.constrain('updateIt', [observable, 'foo']);
    observer.constrain('updateIt', [observable, 'bar']);
    ok(observer.isAttachedTo(observable, 'updateIt', 'bar') === false, "A second constrain should not add a new attachment.");
    
    count = 0;
    observable.fireEvent('foo', 1);
    ok(count === 1, "The original constraint should still run exactly once. Ran " + count + " times.");
    
    // Releasing an unknown method name is harmless.
    observer.releaseConstraint('neverConstrained');
    observer.releaseConstraint();
    ok(true, "Releasing an unknown or missing method name should not throw.");
});