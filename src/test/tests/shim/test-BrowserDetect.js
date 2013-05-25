module('Shim : BrowserDetect');

test("Browser detection extracts browser, OS and version information.", function() {
    ok(BrowserDetect != null, "BrowserDetect should exist.");
    ok(BrowserDetect.browser.length > 0, "A browser should be detected.");
    ok(BrowserDetect.browser != "UNKNOWN", "The browser should be known.");
    ok(BrowserDetect.version != null, "A browser version should be detected.");
    ok(BrowserDetect.version != "UNKNOWN", "The version should be known.");
    ok(BrowserDetect.OS.length > 0, "A browser OS should be detected.");
    ok(BrowserDetect.OS != "UNKNOWN", "The OS should be known.");
});
