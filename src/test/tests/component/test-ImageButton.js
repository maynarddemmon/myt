module('ImageButton');

asyncTest("Create and destroy an ImageButton", 6, function() {
    var div = document.createElement('div');
    div.style.position = 'absolute';
    
    var bdy = document.getElementsByTagName('body')[0];
    bdy.appendChild(div);
    
    var v = new myt.View(div, {width:300, height:300}, [myt.RootView]);
    
    var btn = new myt.ImageButton(v);
    var shrinkBtn = new myt.ImageButton(v, {shrinkToFit:true});
    
    ok(btn != null, "New ImageButton exists");
    ok(shrinkBtn != null, "New shrinkToFit ImageButton exists");
    
    ok(btn.width === 0, "Button should have an initial width of 0.");
    ok(shrinkBtn.width === 0, "ShrinkToFit Button should have an initial width of 0." + shrinkBtn.width);
    
    setTimeout(function() {
        ok(btn.width === 0, "Button should have a width of 0.");
        ok(shrinkBtn.width === 8, "ShrinkToFit Button should have a width of 0." + shrinkBtn.width);
        
        // Destroy it
        v.destroy();
        
        start();
    }, 100);
});
