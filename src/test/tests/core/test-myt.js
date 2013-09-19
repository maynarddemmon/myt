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

