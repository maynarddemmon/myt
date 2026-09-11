/*  Tests for what happens when a BaseModel that already belongs to one
    BaseModelCollection is added to a second one.
    
    The first group asserts invariants that must hold no matter how this is
    resolved. The second group assumes the "refuse the add" approach; if the
    hand-off approach is chosen instead (the first collection releases the model
    as a side effect of adding it to the second) those are the tests to rewrite,
    and the invariant group should still pass unchanged. */
module('ModelMixins - Cross Collection');

// Invariants //////////////////////////////////////////////////////////////////
test("A model is never listed in two collections at once.", function() {
    const first = new myt.BaseModelCollection(),
        second = new myt.BaseModelCollection(),
        model = first.addModel({id:'a'});
    
    second.addModel(model);
    
    const inFirst = first.getById('a') === model,
        inSecond = second.getById('a') === model;
    ok(!(inFirst && inSecond), 'It is in one collection or the other, not both.');
    ok(inFirst || inSecond, 'It is still in at least one collection.');
});

test("The __mc backreference agrees with actual membership.", function() {
    const first = new myt.BaseModelCollection(),
        second = new myt.BaseModelCollection(),
        model = first.addModel({id:'a'});
    
    second.addModel(model);
    
    const owner = model.__mc;
    ok(owner != null, 'The model believes it belongs to a collection.');
    ok(owner.getById('a') === model, 'And that collection actually holds it.');
    ok(
        (first.getById('a') === model) === (owner === first),
        'The first collection holds it only if it is the owner.'
    );
    ok(
        (second.getById('a') === model) === (owner === second),
        'The second collection holds it only if it is the owner.'
    );
});

test("Collection counts stay consistent with membership.", function() {
    const first = new myt.BaseModelCollection(),
        second = new myt.BaseModelCollection(),
        model = first.addModel({id:'a'});
    
    second.addModel(model);
    
    ok(first.getCount() + second.getCount() === 1, 'The model is counted exactly once across both.');
});

test("A model's id always matches the key it is stored under.", function() {
    // The failure this guards against: the first collection releasing the model
    // clears __mc, which lets setId succeed even though a second collection is
    // still holding the model under its old id.
    const first = new myt.BaseModelCollection(),
        second = new myt.BaseModelCollection(),
        model = first.addModel({id:'a'});
    
    second.addModel(model);
    first.removeById('a');
    model.setId('zzz');
    
    for (const collection of [first, second]) {
        for (const key of Object.keys(collection.getAll())) {
            ok(collection.getById(key).id === key, 'Stored under key "' + key + '" with a matching id.');
        }
    }
});

test("Destroying a model through its owner does not leave it in another collection.", function() {
    const first = new myt.BaseModelCollection(),
        second = new myt.BaseModelCollection(),
        model = first.addModel({id:'a'});
    
    second.addModel(model);
    
    // Destroy it through whichever collection ended up owning it.
    model.__mc.removeById('a', true);
    
    ok(model.destroyed === true, 'The model was destroyed.');
    ok(first.getById('a') === undefined, 'The first collection is not holding a destroyed model.');
    ok(second.getById('a') === undefined, 'The second collection is not holding a destroyed model.');
});

test("Change notifications reach every collection still holding the model.", function() {
    const first = new myt.BaseModelCollection(),
        second = new myt.BaseModelCollection(),
        model = first.addModel({id:'a'}),
        fired = [];
    
    second.addModel(model);
    
    const firstObserver = new myt.Eventable();
    firstObserver.onUpdated = () => {fired.push('first');};
    firstObserver.attachTo(first, 'onUpdated', 'updated');
    
    const secondObserver = new myt.Eventable();
    secondObserver.onUpdated = () => {fired.push('second');};
    secondObserver.attachTo(second, 'onUpdated', 'updated');
    
    model.setAndNotifyCollection('id', 'a');
    
    if (first.getById('a') === model) ok(fired.includes('first'), 'The holding collection was notified.');
    if (second.getById('a') === model) ok(fired.includes('second'), 'The holding collection was notified.');
    ok(fired.length === 1, 'Exactly one collection was notified, matching the one that holds it.');
});

// Refuse based fix ////////////////////////////////////////////////////////////
test("Adding a model owned by another collection is refused.", function() {
    const first = new myt.BaseModelCollection(),
        second = new myt.BaseModelCollection(),
        model = first.addModel({id:'a'});
    
    second.addModel(model);
    
    ok(first.getById('a') === model, 'The original collection keeps it.');
    ok(second.getById('a') === undefined, 'The second collection did not take it.');
    ok(model.__mc === first, 'The backreference still points at the original collection.');
    ok(first.getCount() === 1, 'The original count is unchanged.');
    ok(second.getCount() === 0, 'The second collection is still empty.');
});

test("A refused add warns rather than failing silently.", function() {
    const first = new myt.BaseModelCollection(),
        second = new myt.BaseModelCollection(),
        model = first.addModel({id:'a'}),
        originalWarn = console.warn,
        captured = [];
    
    console.warn = (...args) => {captured.push(args.map(String).join(' '));};
    try {
        second.addModel(model);
    } finally {
        console.warn = originalWarn;
    }
    
    ok(captured.length === 1, 'One warning was emitted. Got ' + captured.length + '.');
});

test("A refused add fires no events on either collection.", function() {
    const first = new myt.BaseModelCollection(),
        second = new myt.BaseModelCollection(),
        model = first.addModel({id:'a'}),
        fired = [];
    
    const watch = (collection, tag) => {
        const observer = new myt.Eventable();
        observer.onAdded = () => {fired.push(tag + ':added');};
        observer.onUpdated = () => {fired.push(tag + ':updated');};
        observer.onRemoved = () => {fired.push(tag + ':removed');};
        observer.attachTo(collection, 'onAdded', 'added');
        observer.attachTo(collection, 'onUpdated', 'updated');
        observer.attachTo(collection, 'onRemoved', 'removed');
    };
    watch(first, 'first');
    watch(second, 'second');
    
    const originalWarn = console.warn;
    console.warn = () => {};
    try {
        second.addModel(model);
    } finally {
        console.warn = originalWarn;
    }
    
    deepEqual(fired, [], 'Nothing fired.');
});

test("The explicit transfer workflow moves a model between collections.", function() {
    // Remove from the old collection first, which clears __mc, then add to the new one.
    const first = new myt.BaseModelCollection(),
        second = new myt.BaseModelCollection(),
        model = first.addModel({id:'a'});
    
    first.removeById('a');
    ok(model.__mc === null, 'Removal detached the model.');
    
    second.addModel(model);
    
    ok(second.getById('a') === model, 'The second collection now holds it.');
    ok(model.__mc === second, 'The backreference points at the new collection.');
    ok(first.getCount() === 0, 'The original collection is empty.');
    ok(second.getCount() === 1, 'The new collection has one model.');
});

test("Re-adding a model to the collection that already owns it is not refused.", function() {
    // model.__mc === self, so this must not be mistaken for a cross collection add.
    const collection = new myt.BaseModelCollection(),
        model = collection.addModel({id:'a'}),
        originalWarn = console.warn,
        captured = [];
    
    console.warn = (...args) => {captured.push(args.map(String).join(' '));};
    try {
        collection.addModel(model);
    } finally {
        console.warn = originalWarn;
    }
    
    ok(captured.length === 0, 'No warning. Got: ' + JSON.stringify(captured));
    ok(collection.getById('a') === model, 'Still held.');
    ok(collection.getCount() === 1, 'Still one model.');
});

test("A detached model can be added to a collection without a warning.", function() {
    const collection = new myt.BaseModelCollection(),
        model = new myt.BaseModel({id:'a'}),
        originalWarn = console.warn,
        captured = [];
    
    ok(model.__mc === undefined, 'A freshly built model has no collection.');
    
    console.warn = (...args) => {captured.push(args.map(String).join(' '));};
    try {
        collection.addModel(model);
    } finally {
        console.warn = originalWarn;
    }
    
    ok(captured.length === 0, 'No warning. Got: ' + JSON.stringify(captured));
    ok(collection.getById('a') === model, 'It was added.');
});