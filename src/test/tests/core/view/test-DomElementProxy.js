module('DomElementProxy');

test("Create a DomElementProxy and dispose of the dom element", function() {
    var div = document.createElement('div');
    div.style.position = 'absolute';
    myt.getElement().appendChild(div);
    
    var proxy = new myt.Node(null, {}, [myt.DomElementProxy]);
    
    ok(proxy.domElement === undefined, "No dom element reference should exist yet.");
    ok(proxy.deStyle === undefined, "No dom element style reference should exist yet.");
    ok(div.model === undefined, "No model reference should exist yet on the dom element.");
    
    proxy.setDomElement(div);
    ok(proxy.domElement === div, "Dom element reference should now exist.");
    ok(proxy.deStyle === div.style, "Style reference should now exist.");
    ok(div.model === proxy, "Model reference should now exist.");
    
    // Destroy
    ok(div.parentNode != null, "Dom element should have a parent.");
    proxy.removeDomElement();
    ok(div.parentNode == null, "Dom element should no longer have a parent.");
    
    proxy.disposeOfDomElement();
    ok(proxy.domElement === undefined, "After dispose, no dom element reference should exist yet.");
    ok(proxy.deStyle === undefined, "After dispose, no dom element style reference should exist yet.");
    ok(div.model === undefined, "After dispose, no model reference should exist yet on the dom element.");
    
    proxy.destroy();
});

test("Modify dom class and id", function() {
    var div = document.createElement('div');
    div.style.position = 'absolute';
    myt.getElement().appendChild(div);
    
    var proxy = new myt.Node(null, {domElement:div}, [myt.DomElementProxy]);
    
    ok(div.className === '', 'Div should have no class to start with.');
    ok(proxy.domClass === undefined, 'Proxy should have no domClass to start with.');
    
    proxy.addDomClass('foo');
    ok(div.className === 'foo', 'Div should now have a class.');
    ok(proxy.domClass === 'foo', 'Proxy should now have a domClass.');
    proxy.addDomClass('bar');
    ok(div.className === 'foo bar', 'Div should still have a class.');
    proxy.addDomClass('foo');
    ok(div.className === 'foo bar foo', 'Div should still have a class.');
    
    proxy.removeDomClass('foo');
    ok(div.className === 'bar', 'Div should only have one class.');
    
    proxy.setDomClass('hah');
    ok(div.className === 'hah', 'Div clas should now be set.');
    
    proxy.clearDomClass();
    ok(div.className === '', 'Div class should now be empty.');
    
    // Remove a class that doesn't exist
    proxy.removeDomClass('blah');
    ok(div.className === '', 'Div class should still be empty.');
    
    // Set dom id
    ok(div.id === '', 'Div should have no id to start with.');
    ok(proxy.domId === undefined, 'Proxy have no domId to start with.');
    proxy.setDomId('word');
    ok(div.id === 'word', 'Div should now have an id.');
    ok(proxy.domId === 'word', 'Proxy should now have a domId.');
    
    // Destroy
    proxy.removeDomElement();
    proxy.disposeOfDomElement();
    proxy.destroy();
});

test("getComputedStye, setStyleProperty and setZIndex", function() {
    var div = document.createElement('div');
    div.style.position = 'absolute';
    myt.getElement().appendChild(div);
    
    var proxy = new myt.Node(null, {domElement:div}, [myt.DomElementProxy]);
    
    ok(div.style.left === '', 'Div should have a left style property with a value of empty string initially.');
    proxy.setStyleProperty('left', '10px');
    ok(div.style.left === '10px', 'Left is now 10px.');
    
    var computed = myt.DomElementProxy.getComputedStyle(div);
    ok(computed.zIndex === 'auto', 'Z index defaults to auto.');
    
    ok(div.style.zIndex === '', 'No zIndex yet.');
    proxy.setZIndex(1);
    ok(div.style.zIndex === '1', 'Z index is now 1.');
    
    // Destroy
    proxy.removeDomElement();
    proxy.disposeOfDomElement();
    proxy.destroy();
});
