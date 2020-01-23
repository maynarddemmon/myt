module('SimpleIconTextButton');

asyncTest("Create and destroy a SimpleIconTextButton", function() {
    expect(11);
    
    var v = new myt.View(null, {width:300, height:300}, [myt.RootView]);
    
    var btn = new myt.SimpleIconTextButton(v);
    var shrinkBtn = new myt.SimpleIconTextButton(v, {shrinkToFit:true});
    
    ok(btn != null, "New SimpleIconTextButton exists");
    ok(shrinkBtn != null, "New shrinkToFit SimpleIconTextButton exists");
    
    setTimeout(function() {
        ok(btn.width === 0, "SimpleIconTextButton should have a width of 0.");
        ok(shrinkBtn.width === 0, "ShrinkToFit Button should have a width of 0: " + shrinkBtn.width);
        
        ok(btn.height === 0, "SimpleIconTextButton should have a height of 0.");
        ok(shrinkBtn.height === 0, "ShrinkToFit button should have a height of 0.");
        
        // Change btn to shrinkToFit
        btn.setShrinkToFit(true);
        
        setTimeout(function() {
            ok(btn.width === 0, "SimpleIconTextButton should have a width of 0: " + btn.width);
            ok(btn.height === 0, "SimpleIconTextButton should have a height of 0.");
            
            // Change shrinkToFit to non and set explicit width
            shrinkBtn.setShrinkToFit(false);
            shrinkBtn.setWidth(100);
            setTimeout(function() {
                ok(shrinkBtn.width === 100, "SimpleIconTextButton should have a width of 100: " + shrinkBtn.width);
                
                // Set some text which will change the width on one but not
                // the other
                btn.setText('foo bar');
                shrinkBtn.setText('foo bar');
                
                setTimeout(function() {
                    ok(shrinkBtn.width === 100, "SimpleIconTextButton should have a width of 100: " + shrinkBtn.width);
                    ok(btn.width === 37, "SimpleIconTextButton should have a width of 37: " + btn.width);
                    
                    // Destroy it
                    v.destroy();
                    
                    start();
                }, 50);
            }, 50);
        }, 50);
    }, 50);
});

asyncTest("Set an icon on an SimpleIconTextButton and test y positioning", function() {
    expect(12);
    
    var v = new myt.View(null, {width:300, height:300}, [myt.RootView]);
    
    var iconUrl = './tests/component/rsrc/icon.png';
    var btn = new myt.SimpleIconTextButton(v, {iconUrl:iconUrl});
    var shrinkBtn = new myt.SimpleIconTextButton(v, {shrinkToFit:true, iconUrl:iconUrl});
    
    setTimeout(function() {
        ok(btn.width === 0, "SimpleIconTextButton should have a width of 0.");
        ok(shrinkBtn.width === 16, "ShrinkToFit Button should have a width of 16: " + shrinkBtn.width);
        
        // Set some text too.
        btn.setText('foo bar');
        shrinkBtn.setText('foo bar');
        
        setTimeout(function() {
            ok(btn.width === 0, "SimpleIconTextButton should have a width of 0.");
            ok(shrinkBtn.width === 55, "ShrinkToFit Button should have a width of 55: " + shrinkBtn.width);
           
            // Set textY and iconY
            ok(shrinkBtn.textY === 'middle', "Text should start out valign middle.");
            ok(shrinkBtn.iconY === 'middle', "Icon should start out valign middle.");
            
            var textView = shrinkBtn.textView;
            var iconView = shrinkBtn.iconView;
            var shrinkBtnHeight = shrinkBtn.height;
            var textTargetY = (shrinkBtnHeight - textView.height) / 2;
            var iconTargetY = (shrinkBtnHeight - iconView.height) / 2;
            ok(textView.y === textTargetY, "Text view should have a y of " + textTargetY + " : " + textView.y);
            ok(iconView.y === iconTargetY, "Icon view should have a y of " + iconTargetY + " : " + iconView.y);
            
            shrinkBtn.setTextY(3);
            shrinkBtn.setIconY(5);
            
            ok(shrinkBtn.textView.y === 3, "Text view should have a y of 3.");
            ok(shrinkBtn.iconView.y === 5, "Icon view should have a y of 5.");
            
            // Set iconSpacing
            ok(shrinkBtn.iconSpacing === 2, "Icon spacing should be 2.");
            
            shrinkBtn.setIconSpacing(10);
            
            setTimeout(function() {
                ok(shrinkBtn.width === 63, "ShrinkToFit Button should have a width of 63: " + shrinkBtn.width);
                
                // Destroy it
                v.destroy();
                
                start();
            }, 50);
        }, 50);
    }, 50);
});

asyncTest("Test x positioning of text and icon", function() {
    expect(12);
    
    var v = new myt.View(null, {width:300, height:300}, [myt.RootView]);
    
    var iconUrl = './tests/component/rsrc/icon.png';
    var btn = new myt.SimpleIconTextButton(v, {width:100, iconUrl:iconUrl, text:'foo bar'});
    var shrinkBtn = new myt.SimpleIconTextButton(v, {shrinkToFit:true, iconUrl:iconUrl, text:'foo bar'});
    
    setTimeout(function() {
        ok(btn.width === 100, "SimpleIconTextButton should have a width of 100.");
        ok(shrinkBtn.width === 55, "ShrinkToFit Button should have a width of 55: " + shrinkBtn.width);
        
        ok(btn.iconView.x === 22.5, "Icon should have an x of 22.5: " + btn.iconView.x);
        ok(btn.textView.x === 40.5, "Icon should have an x of 40.5: " + btn.textView.x);
        
        ok(shrinkBtn.iconView.x === 0, "Icon should have an x of 0: " + shrinkBtn.iconView.x);
        ok(shrinkBtn.textView.x === 18, "Icon should have an x of 18: " + shrinkBtn.textView.x);
        
        // Hide icons
        btn.iconView.setVisible(false);
        shrinkBtn.iconView.setVisible(false);
        
        setTimeout(function() {
            ok(btn.textView.x === 31.5, "Text should have an x of 31.5: " + btn.textView.x);
            ok(shrinkBtn.textView.x === 0, "Text should have an x of 0: " + shrinkBtn.textView.x);
            ok(shrinkBtn.width === 37, "Text should still have an x of 37: " + shrinkBtn.width);
            
            // Change the text
            btn.setText('foo bar baz');
            shrinkBtn.setText('foo bar baz');
            
            setTimeout(function() {
                ok(btn.textView.x === 21.5, "Text should have an x of 21: " + btn.textView.x);
                
                ok(shrinkBtn.textView.x === 0, "Text should still have an x of 0: " + shrinkBtn.textView.x);
                ok(shrinkBtn.width === 58, "Text should still have an x of 58: " + shrinkBtn.width);
                
                // Destroy it
                v.destroy();
                
                start();
            }, 50);
        }, 50);
    }, 50);
});
