module('Util : Cookie');

test("Read, write and remove a browser cookie.", function() {
    var randomValue = '' + (new Date()).getTime();
    myt.Cookie.write('_test', randomValue);
    
    var readValue = myt.Cookie.read('_test');
    ok(randomValue === readValue, "Value read back should be identical.");
    
    ok(myt.Cookie.remove('_test'), "Remove should indicate the cookie was removed.");
    
    var readValueAgain = myt.Cookie.read('_test');
    ok(readValueAgain === undefined, "Cookie should no longer exist.");
});
