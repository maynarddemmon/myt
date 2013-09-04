module('Path');

test("Create a Path", function() {
    var path = new myt.Path([0,0, 2,0, 2,3, 1,2, 1,1, 0,1]);
    
    ok(path != null, "Path should exist.");
    
    var box = path.getBoundingBox();
    
    ok(box.x === 0, "Bounding box should have an x of 0.");
    ok(box.y === 0, "Bounding box should have a y of 0.");
    ok(box.width === 2, "Bounding box should have a width of 2.");
    ok(box.height === 3, "Bounding box should have a height of 3.");
    
    var center = path.getCenter();
    
    ok(center.x === 1, "Center should have an x of 1.");
    ok(center.y === 1.5, "Center should have a y of 1.5.");
    
    ok(path.isPointInPath({x:-1, y:1}) === false, "Point -1,1 is not in path.");
    ok(path.isPointInPath({x:2.01, y:1}) === false, "Point 2.01,1 is not in path.");
    
    ok(path.isPointInPath({x:1.999, y:1}) === true, "Point 1.999,1 is in path.");
    ok(path.isPointInPath({x:2.001, y:1}) === false, "Point 2.001,1 is not in path.");
    
    ok(path.isPointInPath({x:0, y:0}) === true, "Point 0,0 is in path."); // WHY???
    ok(path.isPointInPath({x:0.001, y:0.001}) === true, "Point 0.001,0.001 is in path.");
    ok(path.isPointInPath({x:0, y:-0.001}) === false, "Point 0,-0.001 is not in path.");
    ok(path.isPointInPath({x:0, y:0.999}) === true, "Point 0,0.999 is in path.");
    
    ok(path.isPointInPath({x:0.5, y:1.5}) === false, "Point 0.5,1.5 is not in path.");
    
    ok(path.isPointInPath({x:0.5, y:0.5}) === true, "Point 0.5,0.5 is in path.");
    ok(path.isPointInPath({x:0.5, y:0.999}) === true, "Point 0.5,0.999 is in path.");
    ok(path.isPointInPath({x:0.5, y:0}) === true, "Point 0.5,0 is in path.");
    ok(path.isPointInPath({x:0.5, y:1.01}) === false, "Point 0.5,1.01 is not in path.");
    
    var path2 = new myt.Path([1,3, 3,5, 5,3, 3,1]);
    ok(path2.isPointInPath({x:3, y:3}) === true, "Point 3,3 is in path.");
    ok(path2.isPointInPath({x:2, y:4.001}) === false, "Point 2,4.001 is not in path.");
    ok(path2.isPointInPath({x:2, y:4}) === true, "Point 2,4 is in path.");
    ok(path2.isPointInPath({x:2, y:3.999}) === true, "Point 2,3.999 is in path.");
    ok(path2.isPointInPath({x:2, y:2}) === true, "Point 2,2 is in path.");
    
    ok(path2.isPointInPath({x:1.001, y:3}) === true, "Point 1.001,3 is in path.");
    ok(path2.isPointInPath({x:0.999, y:3}) === false, "Point 0.999,3 is not in path.");
});

test("Point inside a path that overlaps itself", function() {
    var path = new myt.Path([0,0, 4,0, 4,2, 2,-1, 0,2]);
    
    ok(path.isPointInPath({x:0.5, y:0.5}) === true, "Point 0.5,0.5 is in path.");
    ok(path.isPointInPath({x:2, y:0.1}) === false, "Point 2,0.1 is mpt in path.");
    ok(path.isPointInPath({x:2, y:-0.1}) === true, "Point 2,-0.1 is in path.");
});

test("Point inside a path that overlaps itself to create a hole", function() {
    var path = new myt.Path([0,0, 3,0, 3,3, 1,3, 1,1, 2,1, 2,2, 0,2]);
    
    ok(path.isPointInPath({x:0.5, y:0.5}) === true, "Point 0.5,0.5 is in path.");
    ok(path.isPointInPath({x:1.5, y:1.5}) === false, "Point 1.5,1.5 is not in path.");
    ok(path.isPointInPath({x:2.5, y:2.5}) === true, "Point 2.5,2.5 is in path.");
    ok(path.isPointInPath({x:3.5, y:3.5}) === false, "Point 3.5,3.5 is not in path.");
});
