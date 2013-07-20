module('myt');

test("Test wrapFunction", function() {
    var obj = {
        bonus: 1,
        
        add: function(v1, v2) {
            return v1 + v2 + this.bonus;
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
});

