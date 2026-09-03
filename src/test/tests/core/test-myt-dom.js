module('myt-dom');

test("Test getElement", function() {
    ok(myt.getElement().nodeName === 'BODY', "Body is returned by default.");
    ok(myt.getElement('head').nodeName === 'HEAD', "Providing a tagname will get elements of that type.");
    ok(myt.getElement('script', 1).nodeName === 'SCRIPT', "Providing a tagname and index will work.");
    ok(myt.getElement('abcd') === undefined, "Providing a non-existant tagname will return undefined.");
    ok(myt.getElement('head', 1) === undefined, "Providing a non-existant index will return undefined.");
    ok(myt.getElement('abcd', 1) === undefined, "Providing a non-existant tagname and index will return undefined.");
});
