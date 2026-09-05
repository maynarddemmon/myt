module('myt-deepEqual');

test("Primitives compare by value.", function() {
    ok(myt.deepEqual(1, 1) === true, 'Equal numbers.');
    ok(myt.deepEqual(1, 2) === false, 'Different numbers.');
    ok(myt.deepEqual('a', 'a') === true, 'Equal strings.');
    ok(myt.deepEqual('a', 'b') === false, 'Different strings.');
    ok(myt.deepEqual(true, true) === true, 'Equal booleans.');
    ok(myt.deepEqual(null, null) === true, 'Two nulls.');
    ok(myt.deepEqual(undefined, undefined) === true, 'Two undefineds.');
    ok(myt.deepEqual(null, undefined) === false, 'Null is not undefined.');
    ok(myt.deepEqual(null, {}) === false, 'Null is not an object.');
    ok(myt.deepEqual(1, '1') === false, 'No type coercion.');
});

test("Arrays compare element by element and are order sensitive.", function() {
    ok(myt.deepEqual([], []) === true, 'Two empty arrays.');
    ok(myt.deepEqual([1,2,3], [1,2,3]) === true, 'Equal arrays.');
    ok(myt.deepEqual([1,2], [2,1]) === false, 'Order matters.');
    ok(myt.deepEqual([1,2], [1,2,3]) === false, 'Different lengths.');
    ok(myt.deepEqual([], {}) === false, 'An array is not an object.');
    ok(myt.deepEqual([[1,[2]]], [[1,[2]]]) === true, 'Nested arrays.');
});

test("Objects compare by key and are not order sensitive.", function() {
    ok(myt.deepEqual({}, {}) === true, 'Two empty objects.');
    ok(myt.deepEqual({a:1}, {a:1}) === true, 'Equal objects.');
    ok(myt.deepEqual({a:1, b:2}, {b:2, a:1}) === true, 'Key order does not matter.');
    ok(myt.deepEqual({a:1}, {a:2}) === false, 'Different values.');
    ok(myt.deepEqual({a:1}, {b:1}) === false, 'Different keys.');
    ok(myt.deepEqual({a:1}, {a:1, b:2}) === false, 'Extra key on the right.');
    ok(myt.deepEqual({a:1, b:2}, {a:1}) === false, 'Extra key on the left.');
});

test("Nested structures are compared recursively.", function() {
    ok(myt.deepEqual({a:{b:[1, {c:2}]}}, {a:{b:[1, {c:2}]}}) === true, 'Deeply equal.');
    ok(myt.deepEqual({a:{b:[1, {c:2}]}}, {a:{b:[1, {c:3}]}}) === false, 'Deeply different.');
});

test("Dates compare by time value.", function() {
    ok(myt.deepEqual(new Date(5), new Date(5)) === true, 'Same time.');
    ok(myt.deepEqual(new Date(5), new Date(6)) === false, 'Different time.');
    ok(myt.deepEqual({d:new Date(5)}, {d:new Date(5)}) === true, 'Nested, same time.');
    ok(myt.deepEqual({d:new Date(5)}, {d:new Date(6)}) === false, 'Nested, different time.');
});

test("A Date is not equal to a plain object.", function() {
    // The Date branch only applies when BOTH values are Dates. When only one is,
    // the comparison falls through to the plain object path, and since a Date has
    // no own enumerable keys it compares equal to {}.
    ok(myt.deepEqual(new Date(5), {}) === false, 'Date vs empty object.');
    ok(myt.deepEqual({}, new Date(5)) === false, 'Empty object vs Date.');
});

test("Two structurally identical self-referencing objects are equal.", function() {
    const a = {name:'x'};
    a.self = a;
    const b = {name:'x'};
    b.self = b;
    ok(myt.deepEqual(a, b) === true, 'Self-referencing objects with equal contents.');
});

test("Two structurally identical self-referencing arrays are equal.", function() {
    const a = [1];
    a.push(a);
    const b = [1];
    b.push(b);
    ok(myt.deepEqual(a, b) === true, 'Self-referencing arrays with equal contents.');
});

test("Mutually referencing objects are equal.", function() {
    const a1 = {}, a2 = {};
    a1.other = a2;
    a2.other = a1;
    const b1 = {}, b2 = {};
    b1.other = b2;
    b2.other = b1;
    ok(myt.deepEqual(a1, b1) === true, 'A two node cycle on each side.');
});

test("Cyclic objects with differing contents are not equal.", function() {
    const a = {name:'x'};
    a.self = a;
    const b = {name:'different'};
    b.self = b;
    ok(myt.deepEqual(a, b) === false, 'Cycles must not mask a real difference.');
});

test("Comparing an object to itself is equal even when cyclic.", function() {
    const a = {};
    a.self = a;
    ok(myt.deepEqual(a, a) === true, 'Same reference on both sides.');
});

test("A repeated reference that is not a cycle is compared by value.", function() {
    // The same object appearing twice on one side is not a cycle. It must still
    // compare equal to two separate but equivalent objects on the other side.
    const shared = {v:1};
    ok(
        myt.deepEqual({x:shared, y:shared}, {x:{v:1}, y:{v:1}}) === true,
        'Shared reference on the left, distinct equal objects on the right.'
    );
});

test("Deeply nested cycles terminate rather than overflowing the stack.", function() {
    const a = {level:1, child:{level:2}};
    a.child.parent = a;
    const b = {level:1, child:{level:2}};
    b.child.parent = b;
    let threw = false;
    try {
        myt.deepEqual(a, b);
    } catch {
        threw = true;
    }
    ok(!threw, 'No stack overflow.');
});

test("Test NaN", function() {
    ok(myt.deepEqual(NaN, NaN) === true, 'Primitive NaNs are considered equivalent.');
    ok(myt.deepEqual({num:NaN}, {num:NaN}) === true, 'NaN values should be considered equivalent.');
    ok(myt.deepEqual([NaN], [NaN]) === true, 'NaN values should be considered equivalent.');
    ok(myt.deepEqual(new Date(NaN), new Date(NaN)) === true, 'Dates that are NaN should also be equivalent.');
});