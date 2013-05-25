module('Shim : JSON');

test("JSON exists and has the expected API.", function() {
    ok(JSON != null, "JSON object should exist.");
    ok(typeof JSON.stringify === "function", "JSON object should have a stringify function.");
    ok(typeof JSON.parse === "function", "JSON object should have a parse function.");
});
