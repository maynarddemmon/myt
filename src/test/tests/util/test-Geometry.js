module('Util : Geometry');

test("Test rectContainsPoint.", function() {
    ok(myt.Geometry.rectContainsPoint(0, 0, 1, 1, 3, 3) === false, "Point outside rect should be false.");
    ok(myt.Geometry.rectContainsPoint(2, 2, 1, 1, 3, 3) === true, "Point inside rect should be true.");
    ok(myt.Geometry.rectContainsPoint(1, 1, 1, 1, 3, 3) === true, "Point on boundary of rect should be true.");
    
    // Negative coords should also work
    ok(myt.Geometry.rectContainsPoint( 0,  0, -4, -4, 3, 3) === false, "Negative Point outside rect should be false.");
    ok(myt.Geometry.rectContainsPoint(-2, -2, -4, -4, 3, 3) === true, "Negative Point inside rect should be true.");
    ok(myt.Geometry.rectContainsPoint(-1, -1, -4, -4, 3, 3) === true, "Negative Point on boundary of rect should be true.");
    
    // Negative width and height should always fail
    ok(myt.Geometry.rectContainsPoint(5, 5, 4, 4, -3, -3) === false, "Point outside inverted rect should be false.");
    ok(myt.Geometry.rectContainsPoint(2, 2, 4, 4, -3, -3) === false, "Point inside inverted  rect should be false.");
    ok(myt.Geometry.rectContainsPoint(4, 4, 4, 4, -3, -3) === false, "Point on boundary of inverted  rect should be false.");
    
    // Zero width and height should succeed
    ok(myt.Geometry.rectContainsPoint(1, 1, 1, 1, 0, 0) === true, "Point on boundary of zero size rect should be true.");
});

test("Test measureDistance.", function() {
    ok(myt.Geometry.measureDistance(0, 0, 0, 0) === 0, "Identical points have a distance of zero.");
    ok(myt.Geometry.measureDistance(2, 2, 2, 2) === 0, "Identical points have a distance of zero.");
    ok(myt.Geometry.measureDistance(0, 0, 3, 4) === 5, "345 triangle test.");
    ok(myt.Geometry.measureDistance(1, 1, 4, 5) === 5, "Offset 345 triangle test.");
    ok(myt.Geometry.measureDistance(-10, -10, -7, -6) === 5, "Negative offset 345 Triangle test.");
    ok(myt.Geometry.measureDistance(-1, -1, 2, 3) === 5, "Overlap origin negative offset 345 Triangle test.");
});

test("Test circleContainsPoint.", function() {
    ok(myt.Geometry.circleContainsPoint(0, 0, 1, 1, 1) === false, "Point outside circle should be false.");
    ok(myt.Geometry.circleContainsPoint(0.5, 0.5, 1, 1, 1) === true, "Point inside circle should be true.");
    ok(myt.Geometry.circleContainsPoint(1, 1, 1, 1, 1) === true, "Point at center of circle should be true.");
    ok(myt.Geometry.circleContainsPoint(1, 0, 1, 1, 1) === true, "Point on boundary of circle should be true.");
    ok(myt.Geometry.circleContainsPoint(1, 1, 1, 1, 0) === true, "Point on zero radius circle should be true.");
    ok(myt.Geometry.circleContainsPoint(1, 1, 1, 1, -1) === false, "Point on negative radius circle should be false.");
});
