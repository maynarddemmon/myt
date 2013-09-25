module('myt');

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

test("Test filterObject", function() {
    var obj = {
        foo:"FOO",
        bar:5,
        baz:null,
        biz:undefined
    };
    
    var results = myt.filterObject(obj);
    ok(results === undefined, "Just the undefined value should be removed.");
    
    results = myt.filterObject(obj);
    ok(results === null, "No more undefined value so null should be returned.");
    
    results = myt.filterObject(obj, "FOO");
    ok(results === "FOO", "The matching string value should be found.");
    
    results = myt.filterObject(obj, "FOO");
    ok(results === null, "The matching string value should no longer be found.");
    
    results = myt.filterObject(obj, function(k, v) {return k === 'bar';});
    ok(results === 5, "The match should have a value of 5.");
    
    results = myt.filterObject(obj, function(k, v) {return k === 'bar';});
    ok(results === null, "The matching value should no longer be found.");
    
    var obj2 = {
        foo:"FOO",
        bar:"bar",
        baz:"Baz",
        biz:9
    };
    
    results = myt.filterObject(obj2, "foo", true);
    ok(results.length === 0, "Result should be an empty array since nothing matches.");
    
    results = myt.filterObject(obj2, "FOO", true);
    ok(results.length === 1 && results[0] === "FOO", "Result should be an array.");
    
    results = myt.filterObject(obj2, "FOO", true);
    ok(results.length === 0, "Result should be an empty array.");
    
    results = myt.filterObject(obj2, function(k, v) {return typeof v === 'string';}, true);
    ok(results.length === 2, "Result should be an array of length 2.");
    
    ok(Object.keys(obj2).length === 1, "Object should now only have a 1 key left.");
});

test("Test filterArray", function() {
    var arr = ['foo', 'bar', 'baz', undefined];
    
    var results = myt.filterArray(arr);
    ok(results === undefined, "Just the undefined value should be removed.");
    
    results = myt.filterArray(arr);
    ok(results === null, "No more undefined value so null should be returned.");
    
    results = myt.filterArray(arr, "foo");
    ok(results === "foo", "The matching string value should be found.");
    
    results = myt.filterArray(arr, "foo");
    ok(results === null, "The matching string value should no longer be found.");
    
    results = myt.filterArray(arr, function(v) {return v === 'bar';});
    ok(results === 'bar', "The match should have a value of bar.");
    
    results = myt.filterArray(arr, function(v) {return v === 'bar';});
    ok(results === null, "The matching value should no longer be found.");
    
    var arr2 = ['foo', 'bar', 'baz', undefined];
    
    results = myt.filterArray(arr2, "Foo", true);
    ok(results.length === 0, "Result should be an empty array since nothing matches.");
    
    results = myt.filterArray(arr2, "foo", true);
    ok(results.length === 1 && results[0] === "foo", "Result should be an array.");
    
    results = myt.filterArray(arr2, "foo", true);
    ok(results.length === 0, "Result should be an empty array.");
    
    results = myt.filterArray(arr2, function(v) {return typeof v === 'string';}, true);
    ok(results.length === 2, "Result should be an array of length 2.");
    
    ok(arr2.length === 1, "Array should now only have a length of 1.");
});
