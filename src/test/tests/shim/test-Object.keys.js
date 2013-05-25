module('Shim : Object.keys');

test("Object.keys API exists.", function() {
    ok(typeof Object.keys === "function", "Object should have a keys function.");
});
