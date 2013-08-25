module('Shim : language');

test("Object.keys API exists.", function() {
    ok(typeof Object.keys === "function", "Object should have a keys function.");
});

test("Array.isArray API exists.", function() {
    ok(typeof Array.isArray === "function", "Array should have an isArray function.");
    ok(Array.isArray([]) === true, "[] should be an array.");
    ok(Array.isArray([1]) === true, "[1] should be an array.");
    ok(Array.isArray(new Array()) === true, "new Array() should be an array.");
    ok(Array.isArray(Array.prototype) === true, "Array.prototype should be an array.");
    
    ok(Array.isArray() === false, "empty should not be an array.");
    ok(Array.isArray({}) === false, "{} should not be an array.");
    ok(Array.isArray(null) === false, "null should not be an array.");
    ok(Array.isArray(undefined) === false, "undefined should not be an array.");
    ok(Array.isArray(17) === false, "17 should not be an array.");
    ok(Array.isArray("Array") === false, "'Array' should not be an array.");
    ok(Array.isArray(true) === false, "true should not be an array.");
    ok(Array.isArray(false) === false, "false should not be an array.");
    ok(Array.isArray({__proto__:Array.prototype}) === false, "{__proto__:Array.prototype} should not be an array.");
});

test("Date.now API exists.", function() {
    ok(typeof Date.now === "function", "Date should have a now function.");
    ok(typeof Date.now() === "number", "Date.now should return a number.");
    ok(Date.now() > 1377460000000, "Date.now should be a large number.");
});

test("String trim functions should exist.", function() {
    ok(" foo  ".trim() === "foo", "String.prototype.trim should exist and work.");
    ok(" foo  ".trimLeft() === "foo  ", "String.prototype.trimLeft should exist and work.");
    ok(" foo  ".trimRight() === " foo", "String.prototype.trimRight should exist and work.");
});
