module('Util : URI');

test("Parse and retrieve URLs", function() {
    var urls = [
            'http://www.google.com/',
            'http://www.google.com',
            'http://www.foo.com/a+b+c/',
            'https://www.foo.com/thing?a=A&b=#anchor',
            'https://www.foo.com/?see=foo%20bar%20baz'
        ],
        i = 0,
        len = urls.length,
        url,
        parsedUrl;
    
    for (; len > i;) {
        url = urls[i++];
        parsedUrl = new myt.URI(url);
        ok(url === parsedUrl.toString(), "URL: " + parsedUrl.toString() + " should be: " + url);
    }
});
