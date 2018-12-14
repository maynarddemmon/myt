module('Shim : language');

test("Date.format API exists.", function() {
    ok(typeof Date.prototype.format === "function", "Date should have a format function.");
    var date = new Date();
    date.setYear(2015);
    date.setMonth(3); // April
    date.setDate(9);
    date.setHours(16);
    date.setMinutes(30);
    date.setSeconds(45);
    ok(date.format("Y-m-d H:i:s") === '2015-04-09 16:30:45', "Format a date.");
});
