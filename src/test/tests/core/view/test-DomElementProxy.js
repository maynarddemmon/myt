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

test("getAncestorsArray", function() {
    var v = new myt.View(null, {}, [myt.RootView]);
    
    var sv1 = new myt.View(v);
    var sv2 = new myt.View(v);
    var sv3 = new myt.View(v);
    
    var sv31 = new myt.View(sv3);
    var sv32 = new myt.View(sv3);
    var sv33 = new myt.View(sv3);
    
    var sv331 = new myt.View(sv33);
    
    var none = myt.DomElementProxy.getAncestorsArray(null);
    ok(none.length === 0, "No ancestors of null.");
    
    var ancestorsOfRoot = myt.DomElementProxy.getAncestorsArray(v.domElement);
    ok(ancestorsOfRoot.length === 4, "Four ancestors of root element.");
    ok(ancestorsOfRoot[0] === v.domElement, "First ancestor of root dom element is the dom element itself.");
    ok(ancestorsOfRoot[1] === document.body, "Second ancestor of root dom element is the document body element.");
    ok(ancestorsOfRoot[2] === document.documentElement, "Third ancestor of root dom element is the html element.");
    ok(ancestorsOfRoot[3] === document, "Fourth ancestor of root dom element is the document element.");
    
    ancestorsOfRoot = myt.DomElementProxy.getAncestorsArray(v.domElement, v.domElement);
    ok(ancestorsOfRoot.length === 1, "One ancestor of root element.");
    ok(ancestorsOfRoot[0] === v.domElement, "First ancestor of root dom element is the dom element itself.");
    
    var ancestors = myt.DomElementProxy.getAncestorsArray(sv331.domElement, v.domElement);
    ok(ancestors.length === 4, "Four ancestor of view sv331.");
    ok(ancestors[0] === sv331.domElement, "sv331 is first ancestor.");
    ok(ancestors[1] === sv33.domElement, "sv33 is second ancestor.");
    ok(ancestors[2] === sv3.domElement, "sv3 is third ancestor.");
    ok(ancestors[3] === v.domElement, "v is fourth ancestor.");
    
    ancestors = myt.DomElementProxy.getAncestorsArray(sv331.domElement, sv2.domElement);
    ok(ancestors.length === 7, "Full ancestor array up to document.");
    ok(ancestors[0] === sv331.domElement, "First ancestor is the element itself.");
    ok(ancestors[6] === document, "Seventh ancestor is the document element.");
    v.destroy();
});

test("getZIndexRelativeToAncestor", function() {
    var v = new myt.View(null, {}, [myt.RootView]);
    
    var sv1 = new myt.View(v, {zIndex:1});
    var sv2 = new myt.View(v, {opacity:0.5});
    var sv3 = new myt.View(v);
    
    var sv11 = new myt.View(sv1);
    var sv12 = new myt.View(sv1);
    var sv13 = new myt.View(sv1, {zIndex:2});
    
    var sv21 = new myt.View(sv2, {zIndex:1});
    var sv22 = new myt.View(sv2);
    var sv23 = new myt.View(sv2);
    
    var sv31 = new myt.View(sv3);
    var sv32 = new myt.View(sv3);
    var sv33 = new myt.View(sv3, {zIndex:3});
    
    var sv331 = new myt.View(sv33);
    
    ok(myt.DomElementProxy.getZIndexRelativeToAncestor() === 0, "Undefined returns 0");
    ok(myt.DomElementProxy.getZIndexRelativeToAncestor(null) === 0, "Null returns 0");
    ok(myt.DomElementProxy.getZIndexRelativeToAncestor(null, null) === 0, "Null arguments returns 0");
    ok(myt.DomElementProxy.getZIndexRelativeToAncestor(v.domElement, null) === 0, "Missing ancestor returns 0");
    ok(myt.DomElementProxy.getZIndexRelativeToAncestor(null, v.domElement) === 0, "Missing element returns 0");
    
    ok(myt.DomElementProxy.getZIndexRelativeToAncestor(v.domElement, v.domElement) === 0, "Z-index relative to self is 0.");
    
    ok(myt.DomElementProxy.getZIndexRelativeToAncestor(sv1.domElement, v.domElement) === 1, "Z-index should be 1.");
    ok(myt.DomElementProxy.getZIndexRelativeToAncestor(sv11.domElement, v.domElement) === 1, "Z-index should be 1 since parent has a defined z-index.");
    ok(myt.DomElementProxy.getZIndexRelativeToAncestor(sv13.domElement, v.domElement) === 1, "Z-index should be 1 since parent has a defined z-index.");
    
    ok(myt.DomElementProxy.getZIndexRelativeToAncestor(sv2.domElement, v.domElement) === 0, "Z-index should be 0.");
    ok(myt.DomElementProxy.getZIndexRelativeToAncestor(sv21.domElement, v.domElement) === 0, "Z-index should be 0 since parent has opacity of 0.5.");
    ok(myt.DomElementProxy.getZIndexRelativeToAncestor(sv21.domElement, sv2.domElement) === 1, "Z-index should be 1.");
    
    ok(myt.DomElementProxy.getZIndexRelativeToAncestor(sv33.domElement, v.domElement) === 3, "Z-index should be 3.");
    ok(myt.DomElementProxy.getZIndexRelativeToAncestor(sv331.domElement, v.domElement) === 3, "Z-index should be 3.");
    
    v.destroy();
});
