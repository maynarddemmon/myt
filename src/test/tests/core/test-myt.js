module('myt');

test("Test getElement", function() {
    ok(myt.getElement().nodeName === 'BODY', "Body is returned by default.");
    ok(myt.getElement('head').nodeName === 'HEAD', "Providing a tagname will get elements of that type.");
    ok(myt.getElement('script', 1).nodeName === 'SCRIPT', "Providing a tagname and index will work.");
    ok(myt.getElement('abcd') === undefined, "Providing a non-existant tagname will return undefined.");
    ok(myt.getElement('head', 1) === undefined, "Providing a non-existant index will return undefined.");
    ok(myt.getElement('abcd', 1) === undefined, "Providing a non-existant tagname and index will return undefined.");
});

test("Test fillTextTemplate", function() {
    var template = "A {1}{0} B {1}";
    
    ok(myt.fillTextTemplate() === "", "No template should return ''.");
    ok(myt.fillTextTemplate(template) === "A {1}{0} B {1}", "Fill with no args should work.");
    ok(myt.fillTextTemplate(template, "z") === "A {1}z B {1}", "Partial filling should work.");
    ok(myt.fillTextTemplate(template, "z", "y") === "A yz B y", "Full filling should work.");
    ok(myt.fillTextTemplate(template, "z", "y", "x") === "A yz B y", "Over filling should work.");
    ok(myt.fillTextTemplate(template, "Z{1}z", "y") === "A yZyz B y", "Templates are evaluated in order.");
    ok(myt.fillTextTemplate(template, null, undefined) === "A  B ", "Null or undefined will become ''.");
    ok(myt.fillTextTemplate(template, true, 7) === "A 7true B 7", "Numbers and booleans will work.");
    
    var template2 = "A {{1}}{{0}} B";
    
    ok(myt.fillTextTemplate(template2, "z", "y") === "A {y}{z} B", "Templates with braces should work too.");
    ok(myt.fillTextTemplate(template2, "1", "y") === "A {y}y B", "Inadvertent replacement also works.");
});

test("Test generateLink", function() {
    ok(myt.generateLink('foo', 'bar') === '<a href="#" onclick=\'myt.__handleGeneratedLink(this, "bar", &apos;&apos;); return false;\'>foo</a>', "Basic link generation.");
    ok(myt.generateLink('foo', 'bar', {a:'b', c:'d'}) === '<a href="#" onclick=\'myt.__handleGeneratedLink(this, "bar", &apos;&apos;); return false;\' a="b" c="d">foo</a>', "Basic link generation.");
    ok(myt.generateLink('foo', 'bar', null, {x:5}) === '<a href="#" onclick=\'myt.__handleGeneratedLink(this, "bar", &apos;{"x":5}&apos;); return false;\'>foo</a>', "Basic link generation.");
});

test("Test wrapFunction", function() {
    var obj = {
        bonus: 1,
        
        add: function(v1, v2) {
            return v1 + v2 + this.getBonus();
        },
        
        getBonus: function() {
            return this.bonus;
        }
    };
    ok(obj.add(2, 3) === 6, "Add function works as expected");
    ok(obj.callSuper === undefined, "No callSuper function should exist.");
    
    // Wrap the function
    obj.add = myt.wrapFunction(obj.add, function(v1, v2, v3) {
        var retval = this.callSuper(v1, v2);
        retval = this.callSuper(v1, retval);
        return v3 * retval;
    });
    var v = obj.add(2, 3, 2);
    ok(v === 18, "Wrapped add function should be 18: " + v);
    ok(obj.callSuper === undefined, "No callSuper function should exist.");
    
    // Double wrap the function
    obj.add = myt.wrapFunction(obj.add, function(v1, v2, v3) {
        var retval = this.callSuper(v1, v2, v3);
        retval = this.callSuper(v1, retval, v3);
        return retval / 24;
    });
    v = obj.add(2, 3, 2);
    ok(v === 2, "Double Wrapped add should be 2: " + v);
    ok(obj.callSuper === undefined, "No callSuper function should exist.");
    
    // Wrap across two objects
    var obj2 = {
        bonus: 2,
        
        getBonus: function() {
            return (this.callSuper ? this.callSuper() : 0) + obj2.bonus;
        }
    };
    ok(obj.getBonus() === 1, "Bonus is 1.");
    ok(obj2.getBonus() === 2, "Bonus is 2.");
    
    // Use closure on obj2 to get bonus from that obj rather than obj since
    // this refers to obj.
    obj.getBonus = myt.wrapFunction(obj.getBonus, obj2.getBonus);
    ok(obj.getBonus() === 3, "Bonus should be 3 but was " + obj.getBonus());
    
    // Wrap a function around itself safely
    var obj3 = {
        bonus: 3,
        
        getBonus: function(count) {
            return (--count > 0 ? this.callSuper(count) : 0) + this.bonus;
        }
    };
    ok(obj3.getBonus() === 3, "Bonus is 3.");
    obj3.getBonus = myt.wrapFunction(obj3.getBonus, obj3.getBonus);
    ok(obj3.getBonus(2) === 6, "Bonus should be 6. Was " + obj3.getBonus(2));
    
    // Wrap a function that isn't attached to an object
    var f1 = function() {return 1;};
    var f2 = function() {return (this.callSuper ? this.callSuper() : 0) + 1;};
    ok(f1() === 1, "Function one returns 1.");
    ok(f2() === 1, "Function two returns 1.");
    var f3 = myt.wrapFunction(f1, f2);
    ok(f3() === 2, "Function three returns 2.");
    f3 = myt.wrapFunction(f3, f2);
    ok(f3() === 3, "Function three returns 3.");
});

test("Test areFloatsEqual", function() {
    ok(myt.areFloatsEqual(0.0, 0.0), "0.0 equals 0.0");
    ok(myt.areFloatsEqual(1.0, 1.0), "1.0 equals 1.0");
    ok(myt.areFloatsEqual(-1.0, -1.0), "-1.0 equals -1.0");
    ok(!myt.areFloatsEqual(1.0, -1.0), "1.0 not equal to -1.0");
    ok(!myt.areFloatsEqual(-1.0, 1.0), "1.0 not equal to -1.0");
    
    ok(myt.areFloatsEqual(1.0, 0.9999999), "1.0 equals 0.999999");
    ok(myt.areFloatsEqual(1.0, 1.000001), "1.0 equals 1.000001");
    
    ok(!myt.areFloatsEqual(1.0, 0.999999), "1.0 equals 0.99999");
    ok(!myt.areFloatsEqual(1.0, 1.00001), "1.0 equals 1.00001");
    
    ok(myt.areFloatsEqual(10.5, 10, 0.05), "10.5 is within 5% of 10");
    ok(!myt.areFloatsEqual(10.50001, 10, 0.05), "10.50001 is not within 5% of 10");
    
    ok(myt.areFloatsEqual(10.5, 10, -0.05), "Negative epsilon gets fixed");
    
    ok(!myt.areFloatsEqual(0, 0.000000000000000000001), "Comparison to 0 will always be inequal");
    ok(!myt.areFloatsEqual(0, -0.000000000000000000001), "Comparison to 0 will always be inequal");
    ok(!myt.areFloatsEqual(-0.000000000000000000001, 0.000000000000000000001), "Comparison over 0 will always be inequal");
});

test("Test getRandomInt", function() {
    var r, count = 10; // Repeat a few times since the results are random.
    while (count--) {
        r = myt.getRandomInt(0, 0);
        ok(r === 0, "Random number should always be 0");
        
        r = myt.getRandomInt(1, 1);
        ok(r === 1, "Random number should always be 1");
        
        r = myt.getRandomInt(-2, 3);
        ok(r >= -2 && r <= 3, "Random number should be between -2 and 3");
        
        r = myt.getRandomInt(3, 5);
        ok(r >= 3 && r <= 5, "Random number should be between 3 and 5.");
        
        r = myt.getRandomInt(5, 3);
        ok(r >= 3 && r <= 5, "Incorrect order should still work.");
    }
    
    r = myt.getRandomInt(3, 5, function(v) {return 0;});
    ok(r === 3, "Skew function acts like floor.");
    
    r = myt.getRandomInt(3, 5, function(v) {return -1;});
    ok(r === 3, "Bad skew function with too low of a value still works.");
    
    r = myt.getRandomInt(3, 5, function(v) {return 0.99999999;});
    ok(r === 5, "Skew function acts like ceil.");
    
    r = myt.getRandomInt(3, 5, function(v) {return 1;});
    ok(r === 5, "Bad skew function with too high of a value still works.");
});

test("Test getRandomArbitrary", function() {
    var r, count = 10; // Repeat a few times since the results are random.
    while (count--) {
        r = myt.getRandomArbitrary(0, 0);
        ok(r === 0, "Random number should always be 0");
        
        r = myt.getRandomArbitrary(1, 1);
        ok(r === 1, "Random number should always be 1");
        
        r = myt.getRandomArbitrary(-2.1, 3.5);
        ok(r >= -2.1 && r <= 3.5, "Random number should be between -2 and 3");
        
        r = myt.getRandomArbitrary(3.05, 5.7);
        ok(r >= 3.05 && r <= 5.7, "Random number should be between 3 and 5.");
        
        r = myt.getRandomArbitrary(5.7, 3.05);
        ok(r >= 3.05 && r <= 5.7, "Incorrect order should still work.");
    }
    
    r = myt.getRandomArbitrary(3.05, 5.7, function(v) {return 0;});
    ok(r === 3.05, "Skew function acts like floor.");
    
    r = myt.getRandomArbitrary(3.05, 5.7, function(v) {return -1;});
    ok(r === 3.05, "Bad skew function with too low of a value still works.");
    
    r = myt.getRandomArbitrary(3.05, 5.7, function(v) {return 0.9999999999;});
    ok(myt.areFloatsEqual(r, 5.7), "Skew function acts like ceil.");
    
    r = myt.getRandomArbitrary(3.05, 5.7, function(v) {return 1;});
    ok(myt.areFloatsEqual(r, 5.7), "Bad skew function with too high of a value still works.");
});


test("Test extend", function() {
    var objA = {a:'foo', b:false, c:5}, objB = {a:'bar', d:'hey'};
    
    ok(objA.a === 'foo' && objB.a === 'bar', "Initial value was set.");
    
    // One source
    var source = {e:'here'};
    var result = myt.extend(source, objA);
    
    ok(source === result, "Returned value is the source.");
    ok(objA.a === 'foo' && objB.a === 'bar', "Source value was not changed.");
    ok(objA.d === undefined, "Source value did not have anything added to it.");
    ok(result.a === 'foo' && result.b === false && result.c === 5 && result.e === 'here', "Result has all the values");
    
    // Two sources
    var source2 = {e:'here'};
    var result2 = myt.extend(source2, objA, objB);
    
    ok(source2 === result2, "Returned value is the source.");
    ok(objA.a === 'foo' && objB.a === 'bar', "Source value was not changed.");
    ok(objA.d === undefined, "Source value did not have anything added to it.");
    ok(result2.a === 'bar' && result2.b === false && result2.c === 5 && result2.d === 'hey' && result2.e === 'here', "Result has all the values");
    
    // Two sources and a filter
    var source3 = {e:'here'};
    var result3 = myt.extend(source3, objA, objB, function(key, target, source) {
        if (key === 'a' || source[key] === 'hey') target[key] = source[key];
    });
    
    ok(source3 === result3, "Returned value is the source.");
    ok(objA.a === 'foo' && objB.a === 'bar', "Source value was not changed.");
    ok(objA.d === undefined, "Source value did not have anything added to it.");
    ok(result3.a === 'bar' && result3.b === undefined && result3.c === undefined && result3.d === 'hey' && result3.e === 'here', "Result has all the values that the filter allows.");
});

asyncTest("Test createDelayedMethodCall: Add DelayedMethodCall to an instance.", function() {
    expect(3);
    
    var TestClass = new JS.Class('TestClass', myt.Node, {
        doIt: function() {
            ok(true, "doIt method called.");
            start();
        }
    });
    
    var n = new TestClass();
    
    ok(myt.createDelayedMethodCall(n, 0, 'doIt'), "DelayedMethodCall creation succeeded.");
    ok(typeof n.doItDelayed === 'function', "A doItDelayed function should exist.");
    
    n.doItDelayed();
});

asyncTest("Test createDelayedMethodCall: Add DelayedMethodCall to a class.", function() {
    expect(3);
    
    var TestClass = new JS.Class('TestClass', myt.Node, {
        doIt: function() {
            ok(true, "doIt method called.");
            start();
        }
    });
    
    var n = new TestClass();
    
    ok(myt.createDelayedMethodCall(TestClass, 0, 'doIt'), "DelayedMethodCall creation succeeded.");
    ok(typeof n.doItDelayed === 'function', "A doItDelayed function should exist.");
    
    n.doItDelayed();
});

asyncTest("Test createDelayedMethodCall: Two calls collapse into one.", function() {
    expect(1);
    
    var TestClass = new JS.Class('TestClass', myt.Node, {
        doIt: function() {
            ok(true, "doIt method called.");
            start();
        }
    });
    
    var n = new TestClass();
    
    myt.createDelayedMethodCall(n, 0, 'doIt');
    
    n.doItDelayed();
    n.doItDelayed();
});

asyncTest("Test createDelayedMethodCall: Ensure delay is long enough.", function() {
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
    myt.createDelayedMethodCall(n, delay, 'doIt');
    
    n.doItDelayed();
});
