module('myt');

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
    
    r = myt.getRandomInt(3, 5, function(_v) {return 0;});
    ok(r === 3, "Skew function acts like floor.");
    
    r = myt.getRandomInt(3, 5, function(_v) {return -1;});
    ok(r === 3, "Bad skew function with too low of a value still works.");
    
    r = myt.getRandomInt(3, 5, function(_v) {return 0.99999999;});
    ok(r === 5, "Skew function acts like ceil.");
    
    r = myt.getRandomInt(3, 5, function(_v) {return 1;});
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
    
    r = myt.getRandomArbitrary(3.05, 5.7, function(_v) {return 0;});
    ok(r === 3.05, "Skew function acts like floor.");
    
    r = myt.getRandomArbitrary(3.05, 5.7, function(_v) {return -1;});
    ok(r === 3.05, "Bad skew function with too low of a value still works.");
    
    r = myt.getRandomArbitrary(3.05, 5.7, function(_v) {return 0.9999999999;});
    ok(myt.areFloatsEqual(r, 5.7), "Skew function acts like ceil.");
    
    r = myt.getRandomArbitrary(3.05, 5.7, function(_v) {return 1;});
    ok(myt.areFloatsEqual(r, 5.7), "Bad skew function with too high of a value still works.");
});
