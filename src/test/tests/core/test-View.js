module('View');

test("Create and destroy a view", function() {
    var div = document.createElement('div');
    div.style.position = 'absolute';
    
    ok(div.id == null || div.id == '', "Div should not have an id yet." + div.id);
    
    var bdy = document.getElementsByTagName('body')[0];
    bdy.appendChild(div);
    
    var divId = 'testDivId';
    var v = new myt.View(div, {domId:divId}, [myt.RootView]);
    
    ok(v != null, "New view exists");
    ok(div.model === v, "Model for div should be the new view.");
    ok(v.domElement === div, "domElement for view should be the div.");
    ok(v.deStyle === div.style, "deStyle for view should be the style from the div.");
    
    ok(v.domId === divId, "domId for view should have been set.");
    ok(v.domId === div.id, "domId and div.id should be equal.");
    
    var divFromDoc = document.getElementById(divId);
    ok(div === divFromDoc, "Div obtained from document should be the same div.");
    
    // Destroy it
    v.destroy();
    
    ok(v.destroyed === true, "The destroyed property of the new view should be true.");
    ok(v.domElement == null, "The domElement reference should not exists anymore.");
    ok(v.deStyle == null, "The deStyle reference should not exists anymore.");
    
    var divFromDocAgain = document.getElementById(divId);
    ok(divFromDocAgain == null, "Div obtained from document after destroy should not exist.");
});

test("Create and destroy a view with keepDomElementWhenDestroyed set to true.", function() {
    var div = document.createElement('div');
    div.style.position = 'absolute';
    
    ok(div.id == null || div.id == '', "Div should not have an id yet." + div.id);
    
    var bdy = document.getElementsByTagName('body')[0];
    bdy.appendChild(div);
    
    var divId = 'testDivId';
    var v = new myt.View(div, {domId:divId, keepDomElementWhenDestroyed:true}, [myt.RootView]);
    
    ok(v != null, "New view exists");
    ok(div.model === v, "Model for div should be the new view.");
    ok(v.domElement === div, "domElement for view should be the div.");
    ok(v.deStyle === div.style, "deStyle for view should be the style from the div.");
    
    ok(v.domId === divId, "domId for view should have been set.");
    ok(v.domId === div.id, "domId and div.id should be equal.");
    
    var divFromDoc = document.getElementById(divId);
    ok(div === divFromDoc, "Div obtained from document should be the same div.");
    
    // Destroy it
    v.destroy();
    
    ok(v.destroyed === true, "The destroyed property of the new view should be true.");
    ok(v.domElement == null, "The domElement reference should not exists anymore.");
    ok(v.deStyle == null, "The deStyle reference should not exists anymore.");
    
    var divFromDocAgain = document.getElementById(divId);
    ok(div === divFromDoc, "Div obtained from document after destroy should still exist.");
    
    // Cleanup
    div.parentNode.removeChild(div);
});

test("View position, size and clip.", function() {
    var div = document.createElement('div');
    div.style.position = 'absolute';
    
    ok(div.id == null || div.id == '', "Div should not have an id yet." + div.id);
    
    var bdy = document.getElementsByTagName('body')[0];
    bdy.appendChild(div);
    
    var v = new myt.View(div, {x:10, y:20, width:30, height:40}, [myt.RootView]);
    
    ok(v.x === 10, "View should have an x of 10.");
    ok(v.get('x') === 10, "View getter for x should return 10");
    ok(v.deStyle.left === '10px', "domElement.style.left should be 10px.");
    ok(v.domElement.offsetLeft === 10, "Dom element should have an offsetLeft of 10.");
    
    ok(v.y === 20, "View should have an y of 20.");
    ok(v.get('y') === 20, "View getter for y should return 20");
    ok(v.deStyle.top === '20px', "domElement.style.top should be 20px.");
    ok(v.domElement.offsetTop === 20, "Dom element should have an offsetTop of 20.");
    
    ok(v.width === 30, "View should have a width of 30.");
    ok(v.get('width') === 30, "View getter for width should return 30");
    ok(v.deStyle.width === '30px', "domElement.style.width should be 30px.");
    ok(v.domElement.offsetWidth === 30, "Dom element should have an offsetWidth of 30.");
    
    ok(v.height === 40, "View should have an height of 40.");
    ok(v.get('height') === 40, "View getter for height should return 40");
    ok(v.deStyle.height === '40px', "domElement.style.height should be 40px.");
    ok(v.domElement.offsetHeight === 40, "Dom element should have an offsetHeight of 40.");
    
    // Should be no clip
    ok(v.deStyle.clip === '', "No clip is applied so none should exist.");
    ok(v.clip === false, "Clip should be initially false.");
    v.setClip(true);
    ok(v.deStyle.clip === 'rect(0px 30px 40px 0px)' || 
        v.deStyle.clip === 'rect(0px, 30px, 40px, 0px)', 
        "True clip so it should be a rect: " + v.deStyle.clip
    ); // commas are in firefox.
    v.setClip(false);
    ok(v.deStyle.clip === 'auto', "False clip applied so it should now be auto.");
    
    // Bounding client rect
    var bounds = v.domElement.getBoundingClientRect();
    ok(bounds.left === 10, "Bounding client rect should have a left of 10.");
    ok(bounds.top === 20, "Bounding client rect should have a top of 20.");
    ok(bounds.width === 30, "Bounding client rect should have a width of 30.");
    ok(bounds.height === 40, "Bounding client rect should have a height of 40.");
    
    // Set values
    v.setX(5);
    ok(v.domElement.offsetLeft === 5, "Dom element should have an offsetLeft of 5.");
    
    v.setY(15);
    ok(v.domElement.offsetTop === 15, "Dom element should have an offsetTop of 5.");
    
    v.setWidth(25);
    ok(v.domElement.offsetWidth === 25, "Dom element should have an offsetWidth of 5.");
    
    v.setHeight(35);
    ok(v.domElement.offsetHeight === 35, "Dom element should have an offsetHeight of 5.");
    
    // Negative widths and heights
    v.setWidth(-10);
    ok(v.width === 0, "View should have an width of 0.");
    ok(v.domElement.offsetWidth === 0, "Dom element should have an offsetWidth of 0.");
    
    v.setHeight(-20);
    ok(v.height === 0, "View should have an height of 0.");
    ok(v.domElement.offsetHeight === 0, "Dom element should have an offsetHeight of 0.");
    
    // Destroy it
    v.destroy();
});

test("View alignment", function() {
    var div = document.createElement('div');
    div.style.position = 'absolute';
    
    ok(div.id == null || div.id == '', "Div should not have an id yet." + div.id);
    
    var bdy = document.getElementsByTagName('body')[0];
    bdy.appendChild(div);
    
    var divId = 'testDivId';
    var v = new myt.View(div, {x:0, y:0, width:100, height:50}, [myt.RootView]);
    var child1 = new myt.View(v, {width:10, height:5, domId:divId});
    var child2 = new myt.View(v, {width:10, height:5, align:'center'});
    var child3 = new myt.View(v, {width:10, height:5, valign:'middle'});
    
    ok(child1.x === 0, "View should have an x of 0.");
    ok(child1.domElement.offsetLeft === 0, "Dom element should have an offsetLeft of 0.");
    ok(child1.y === 0, "View should have an y of 0.");
    ok(child1.domElement.offsetTop === 0, "Dom element should have an offsetTop of 0.");
    
    ok(child2.x === 45, "View should have an x of 45.");
    ok(child2.domElement.offsetLeft === 45, "Dom element should have an offsetLeft of 45.");
    ok(child2.y === 0, "View should have an y of 0.");
    ok(child2.domElement.offsetTop === 0, "Dom element should have an offsetTop of 0.");
    
    ok(child3.y === 22.5, "Valign middle view should have an y of 22.");
    ok(child3.domElement.offsetTop === 23, "Valign middle dom element should have an offsetTop of 22.");
    var bounds = child3.domElement.getBoundingClientRect();
    console.log(bounds);
    ok(bounds.top === 22.5, "Bounding client rect should have a top of 22.5: " + bounds.top);
    
    // resize parent
    v.setWidth(200);
    
    ok(child2.x === 95, "View should have an x of 95.");
    ok(child2.domElement.offsetLeft === 95, "Dom element should have an offsetLeft of 95.");
    
    // Change alignment
    child2.setAlign('right');
    
    ok(child2.x === 190, "View should have an x of 190 after right alignment.");
    ok(child2.domElement.offsetLeft === 190, "Dom element should have an offsetLeft of 190 after right alignment.");
    
    child2.setWidth('20');
    
    ok(child2.x === 180, "View should have an x of 180 after width change.");
    ok(child2.domElement.offsetLeft === 180, "Dom element should have an offsetLeft of 180 after width change.");
    
    child2.setAlign('left');
    
    ok(child2.x === 0, "View should have an x of 0 after left alignment.");
    ok(child2.domElement.offsetLeft === 0, "Dom element should have an offsetLeft of 0 after left alignment.");
    
    // resize parent
    v.setHeight(100);
    
    ok(child3.y === 47.5, "View should have a y of 47.5.");
    ok(child3.domElement.offsetTop === 48, "Dom element should have an offsetTop of 48.");
    
    // Change valign
    child3.setValign('bottom');
    
    ok(child3.y === 95, "View should have a y of 95 after bottom alignment.");
    ok(child3.domElement.offsetTop === 95, "Dom element should have an offsetLeft of 95 after bottom alignment.");
    
    child3.setHeight('10');
    
    ok(child3.y === 90, "View should have an y of 90 after height change.");
    ok(child3.domElement.offsetTop === 90, "Dom element should have an offsetTop of 90 after height change.");
    
    child3.setValign('top');
    
    ok(child3.y === 0, "View should have a y of 0 after top alignment.");
    ok(child3.domElement.offsetTop === 0, "Dom element should have an offsetTop of 0 after top alignment.");
    
    // Remove alignment
    child2.setAlign('center');
    child2.setAlign('');
    v.setWidth(160);
    ok(child2.x === 90, "View should still have a y of 90 after removing align.");
    ok(child2.domElement.offsetLeft === 90, "Dom element should still have an offsetLeft of 90 after removing align.");
    
    // Remove vertical alignment
    child3.setValign('middle');
    child3.setValign('');
    v.setHeight(80);
    ok(child3.y === 45, "View should still have a y of 45 after removing valign.");
    ok(child3.domElement.offsetTop === 45, "Dom element should still have an offsetTop of 45 after removing valign.");
    
    // Destroy it
    v.destroy();
    
    var divFromDocAgain = document.getElementById(divId);
    ok(divFromDocAgain == null, "Div obtained from document after destroy should not exist.");
});
