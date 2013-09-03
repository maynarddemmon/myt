module('BoundedRangeComponent');

test("Create a BoundedRangeComponent", function() {
    var c = new myt.Node(null, {}, [myt.BoundedRangeComponent]);
    
    ok(c != null, "New BoundedRangeComponent exists");
    ok(c.getValue() === undefined, "Value should be undefined");
    ok(c.minValue === undefined, "Min value should be undefined");
    ok(c.maxValue === undefined, "Max value should be undefined");
    ok(c.getLowerValue() === undefined, "Lower value should be undefined");
    ok(c.getUpperValue() === undefined, "Upper value should be undefined");
    
    c.setValue(null);
    
    ok(c.getValue() === null, "Value should be null after setting it to null. " + c.getValue());
    
    c.setValue({lower:3, upper:7});
    
    ok(c.getValue().lower === 3, "Lower value should be 3.");
    ok(c.getValue().upper === 7, "Upper value should be 7.");
    
    c.setLowerValue(5);
    ok(c.getValue().lower === 5, "Lower value should be 5.");
    
    c.setUpperValue(9);
    ok(c.getValue().upper === 9, "Lower value should be 9.");
    
    c.setUpperValue(4);
    ok(c.getValue().lower === 4, "Upper and lower should have been swaped");
    ok(c.getValue().upper === 5, "Upper should be the old lower.");
    
    c.setMinValue(5);
    ok(c.minValue === 5, "minValue should be 5.");
    ok(c.getValue().lower === 5, "Lower should now be 5");
    ok(c.getValue().upper === 5, "Upper should still be 5");
    
    c.setUpperValue(10);
    ok(c.getValue().upper === 10, "Lower value should be 10.");
    
    c.setMaxValue(8);
    ok(c.maxValue === 8, "maxValue should be 8.");
    ok(c.getValue().lower === 5, "Lower should still be 5");
    ok(c.getValue().upper === 8, "Upper should now be 8");
    
    c.setMaxValue(4);
    ok(c.maxValue === 5, "maxValue should be limited to minValue.");
    ok(c.getValue().lower === 5, "Lower should still be 5");
    ok(c.getValue().upper === 5, "Upper should now be 8");
    
    c.setUpperValue(6);
    ok(c.getValue().upper === 5, "Upper should not change to exceed max");
    
    c.setUpperValue(4);
    ok(c.getValue().upper === 5, "Upper should not change to below min");
    
    c.setLowerValue(4);
    ok(c.getValue().lower === 5, "Lower should not change to below min");
    
    c.setLowerValue(6);
    ok(c.getValue().lower === 5, "Lower should not change to exceed max");
    
    c.destroy();
});

test("Create a BoundedRangeComponent and initialize it", function() {
    var c = new myt.Node(null, {lowerValue:3, upperValue:7, minValue:1, maxValue:9}, [myt.BoundedRangeComponent]);
    
    ok(c.getValue().upper === 7, "Upper should be 7.");
    ok(c.getValue().lower === 3, "Lower should be 3.");
    ok(c.minValue === 1, "Min value should be 1.");
    ok(c.maxValue === 9, "Max value shoudl be 9.");
    
    var d = new myt.Node(null, {lowerValue:0, upperValue:10, minValue:1, maxValue:9}, [myt.BoundedRangeComponent]);
    
    ok(d.getValue().upper === 9, "Upper should be 9.");
    ok(d.getValue().lower === 1, "Lower should be 1.");
    ok(d.minValue === 1, "Min value should be 1.");
    ok(d.maxValue === 9, "Max value shoudl be 9.");
    
    c.destroy();
    d.destroy();
});

test("Filter chaining", function() {
    var c = new myt.Node(null, {lowerValue:51, upperValue:77, minValue:-97, maxValue:97}, [myt.BoundedRangeComponent]);
    
    ok(c.getValue().upper === 77, "Upper should be 77.");
    ok(c.getValue().lower === 51, "Lower should be 51.");
    
    c.chainValueFilter(function(v) {
        v.lower = v.lower - v.lower % 5;
        v.upper = v.upper - v.upper % 5;
        return v;
    });
    
    ok(c.getValue().upper === 75, "Upper should be 75.");
    ok(c.getValue().lower === 50, "Lower should be 50.");
    
    c.setUpperValue(99);
    ok(c.getValue().upper === 95, "Upper should be 95.");
    
    c.setUpperValue(100);
    ok(c.getValue().upper === 97, "Upper should be 97.");
    
    c.destroy();
});

test("Snap to integer", function() {
    var c = new myt.Node(null, {lowerValue:4.1, upperValue:9.9, minValue:0.3, maxValue:10.2}, [myt.BoundedRangeComponent]);
    
    ok(c.getValue().upper === 10, "Upper should be 10.");
    ok(c.getValue().lower === 4, "Lower should be 4.");
    
    c.setLowerValue(5.1);
    c.setUpperValue(8.9);
    
    ok(c.getValue().upper === 9, "Upper should be 9.");
    ok(c.getValue().lower === 5, "Lower should be 5.");
    
    c.setSnapToInt(false);
    
    c.setLowerValue(5.3);
    c.setUpperValue(8.7);
    
    ok(c.getValue().upper === 8.7, "Upper should be 8.7.");
    ok(c.getValue().lower === 5.3, "Lower should be 5.3.");
    
    c.setSnapToInt(true);
    
    ok(c.getValue().upper === 9, "Upper should be 9.");
    ok(c.getValue().lower === 5, "Lower should be 5.");
    
    c.setMinValue(1.2);
    ok(c.minValue === 1, "Min value should get rounded.");
    
    c.setMaxValue(9.2);
    ok(c.maxValue === 9, "Max value should get rounded.");
    
    c.destroy();
});
