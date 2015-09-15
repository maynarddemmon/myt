module('Color');

test("Create a Color", function() {
    var colorNumber = 774, // 0,3,6 as a color number
        colorHex = '#000306',
        color = new myt.Color(0,3,6);
    ok(color != null, "Color should exist.");
    
    ok(color.red === 0, "Red channel should be 0.");
    ok(color.green === 3, "Green channel should be 3.");
    ok(color.blue === 6, "Blue channel should be 6.");
    
    ok(color.getColorNumber() === colorNumber, "getColorNumber must return the correct value");
    ok(color.getHtmlHexString() === colorHex, "getHtmlHexString must return the correct value");
    
    var color2 = myt.Color.makeColorFromNumber(colorNumber);
    ok(color2 != null, "Color created by makeColorFromNumber should exist.");
    
    ok(color.equals(color2), "The two colors should be equal.");
    
    color.setRed(100);
    ok(color.red === 100, "Red channel should be 100.");
    color.setGreen(50);
    ok(color.green === 50, "Green channel should be 50.");
    color.setBlue(25);
    ok(color.blue === 25, "Blue channel should be 25.");
    
    color.setRed(300);
    ok(color.red === 255, "Red channel should be 255.");
    color.setBlue(-10);
    ok(color.blue === 0, "Blue channel should be 0.");
    
    // Blend two colors
    var color3 = myt.Color.makeColorFromHexString('#0099ff');
    var color4 = myt.Color.makeColorFromHexString('#6633dd');
    var blended = myt.Color.makeBlendedColor(color3, color4, 0.5);
    ok(blended.getHtmlHexString() === '#3366ee', "The blended color should equal #3366ee");
});
