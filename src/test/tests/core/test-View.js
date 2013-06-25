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
    ok(v.deStyle.clip === 'rect(0px 30px 40px 0px)', "True clip so it should be a rect.");
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
