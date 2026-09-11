/*  Tests for the BaseModel and BaseModelCollection classes in ModelMixins.js.
    
    Note that BaseModel's default getAsObj only reports the id, so two models
    with the same id are "similar" as far as the base class is concerned. Tests
    that need a model with real fields to compare use the Person subclass
    defined in each test, which is also closer to how these are used in practice. */
module('ModelMixins');

// BaseModel ///////////////////////////////////////////////////////////////////
test("A BaseModel is inited with the attrs it was given.", function() {
    const model = new myt.BaseModel({id:'x'});
    ok(model.id === 'x', 'The id was set.');
    ok(model.inited === true, 'The model finished initializing.');
});

test("getAsObj returns the id by default.", function() {
    deepEqual(new myt.BaseModel({id:'x'}).getAsObj(), {id:'x'}, 'Only the id is reported.');
});

test("The modelCollection attr is moved into the private __mc attr.", function() {
    const collection = new myt.BaseModelCollection(),
        model = new myt.BaseModel({id:'x', modelCollection:collection});
    ok(model.__mc === collection, 'The collection is stored privately.');
    ok(model.modelCollection === undefined, 'The public attr was deleted rather than set.');
});

test("similarTo compares against a plain object.", function() {
    const model = new myt.BaseModel({id:'x'});
    ok(model.similarTo({id:'x'}) === true, 'Matching id.');
    ok(model.similarTo({id:'y'}) === false, 'Different id.');
    ok(model.similarTo({id:'x', extra:1}) === false, 'Extra keys make it dissimilar.');
});

test("similarTo compares against another BaseModel.", function() {
    const model = new myt.BaseModel({id:'x'});
    ok(model.similarTo(new myt.BaseModel({id:'x'})) === true, 'Matching id.');
    ok(model.similarTo(new myt.BaseModel({id:'y'})) === false, 'Different id.');
});

test("similarTo compares a model in a collection to an equivalent one outside it.", function() {
    // Collection membership is tracked in the private __mc attr. Since similarTo
    // compares getAsObj output rather than the instances themselves, that
    // bookkeeping must not make two otherwise equal models look different.
    const collection = new myt.BaseModelCollection(),
        inCollection = collection.addModel({id:'x'}),
        standalone = new myt.BaseModel({id:'x'});
    ok(inCollection.__mc === collection, 'The first model is in a collection.');
    ok(standalone.__mc === undefined, 'The second model is not.');
    ok(inCollection.similarTo(standalone) === true, 'They are still similar.');
});

test("similarTo handles null, undefined and identity.", function() {
    const model = new myt.BaseModel({id:'x'});
    ok(model.similarTo(null) === false, 'Null.');
    ok(model.similarTo(undefined) === false, 'Undefined.');
    ok(model.similarTo(model) === true, 'The model itself.');
});

// BaseModelCollection: defaults ///////////////////////////////////////////////
test("A BaseModelCollection has sensible defaults.", function() {
    const collection = new myt.BaseModelCollection();
    ok(collection.idField === 'id', 'idField defaults to "id".');
    ok(collection.modelClass === myt.BaseModel, 'modelClass defaults to BaseModel.');
    ok(collection.getCount() === 0, 'It starts empty.');
});

test("A BaseModelCollection uses the modelClass it was given.", function() {
    const Person = new JS.Class('Person', myt.BaseModel, {}),
        collection = new myt.BaseModelCollection({modelClass:Person}),
        model = collection.addModel({id:'p1'});
    ok(model.isA(Person), 'Models are created from the provided class.');
});

// BaseModelCollection: adding /////////////////////////////////////////////////
test("addModel creates a model from a plain object.", function() {
    const collection = new myt.BaseModelCollection(),
        model = collection.addModel({id:'a'});
    ok(model.id === 'a', 'The returned model has the id.');
    ok(collection.getCount() === 1, 'The collection has one model.');
    ok(collection.getById('a') === model, 'It is stored under its id.');
    ok(model.__mc === collection, 'The model knows its collection.');
});

test("addModel accepts an already built model.", function() {
    const collection = new myt.BaseModelCollection(),
        model = collection.addModel(new myt.BaseModel({id:'a'}));
    ok(collection.getById('a') === model, 'The provided instance was stored, not a copy.');
    ok(model.__mc === collection, 'The collection was set on it.');
});

test("addModel with an existing id and no changes does not replace the model.", function() {
    const collection = new myt.BaseModelCollection(),
        first = collection.addModel({id:'a'});
    ok(collection.addModel({id:'a'}) === first, 'The same instance comes back.');
    ok(collection.getCount() === 1, 'No second model was added.');
});

test("addModel with an existing id updates the model in place.", function() {
    // This is the path that runs model.similarTo(attrsOrModel) with a plain
    // object, then feeds that object to callSetters.
    const Person = new JS.Class('Person', myt.BaseModel, {
            getAsObj: function() {return {id:this.id, name:this.name};},
            setName: function(v) {this.set('name', v, true);}
        }),
        collection = new myt.BaseModelCollection({modelClass:Person}),
        first = collection.addModel({id:'p1', name:'Alice'}),
        second = collection.addModel({id:'p1', name:'Bob'});
    ok(second === first, 'The existing instance was updated rather than replaced.');
    ok(first.name === 'Bob', 'The new value was applied.');
    ok(collection.getCount() === 1, 'Still only one model.');
});

test("addModel without an id does not store anything.", function() {
    const collection = new myt.BaseModelCollection(),
        model = collection.addModel({name:'no id here'});
    ok(model == null, 'No model should be returned.');
    ok(collection.getCount() === 0, 'But nothing was stored.');
});

// BaseModelCollection: events /////////////////////////////////////////////////
test("Adding and removing fire added and removed events.", function() {
    const collection = new myt.BaseModelCollection(),
        observer = new myt.Eventable(),
        fired = [];
    observer.onAdded = event => {fired.push('added:' + event.value.id);};
    observer.onRemoved = event => {fired.push('removed:' + event.value.id);};
    observer.attachTo(collection, 'onAdded', 'added');
    observer.attachTo(collection, 'onRemoved', 'removed');
    
    collection.addModel({id:'a'});
    deepEqual(fired, ['added:a'], 'An added event fired.');
    
    fired.length = 0;
    collection.removeById('a');
    deepEqual(fired, ['removed:a'], 'A removed event fired.');
});

test("Re-adding an unchanged model fires no event.", function() {
    const collection = new myt.BaseModelCollection(),
        observer = new myt.Eventable(),
        fired = [];
    observer.onAny = event => {fired.push(event.type);};
    observer.attachTo(collection, 'onAny', 'added');
    observer.attachTo(collection, 'onAny', 'updated');
    
    collection.addModel({id:'a'});
    fired.length = 0;
    collection.addModel({id:'a'});
    deepEqual(fired, [], 'Nothing fired for an identical re-add.');
});

test("Changing a model through addModel fires an updated event.", function() {
    const Person = new JS.Class('Person', myt.BaseModel, {
            getAsObj: function() {return {id:this.id, name:this.name};},
            setName: function(v) {this.set('name', v, true);}
        }),
        collection = new myt.BaseModelCollection({modelClass:Person}),
        observer = new myt.Eventable(),
        fired = [];
    observer.onUpdated = event => {fired.push('updated:' + event.value.name);};
    observer.attachTo(collection, 'onUpdated', 'updated');
    
    collection.addModel({id:'p1', name:'Alice'});
    fired.length = 0;
    collection.addModel({id:'p1', name:'Bob'});
    deepEqual(fired, ['updated:Bob'], 'An updated event fired with the changed model.');
});

test("setAndNotifyCollection fires an updated event on the collection.", function() {
    const Person = new JS.Class('Person', myt.BaseModel, {
            getAsObj: function() {return {id:this.id, name:this.name};},
            setName: function(v) {this.set('name', v, true);}
        }),
        collection = new myt.BaseModelCollection({modelClass:Person}),
        model = collection.addModel({id:'p1', name:'Alice'}),
        observer = new myt.Eventable(),
        fired = [];
    observer.onUpdated = event => {fired.push('updated:' + event.value.name);};
    observer.attachTo(collection, 'onUpdated', 'updated');
    
    model.setAndNotifyCollection('name', 'Carol');
    ok(model.name === 'Carol', 'The attr was set.');
    deepEqual(fired, ['updated:Carol'], 'The collection was notified.');
});

test("setAndNotifyCollection on a model with no collection does not throw.", function() {
    const model = new myt.BaseModel({id:'x'});
    model.setAndNotifyCollection('id', 'y');
    ok(model.id === 'y', 'The attr was still set.');
});

// BaseModelCollection: lookup /////////////////////////////////////////////////
test("getById and isUniqueID.", function() {
    const collection = new myt.BaseModelCollection();
    collection.addModel({id:'a'});
    ok(collection.getById('a').id === 'a', 'Finds an existing model.');
    ok(collection.getById('nope') === undefined, 'Returns undefined for a missing id.');
    ok(collection.isUniqueID('nope') === true, 'An unused id is unique.');
    ok(collection.isUniqueID('a') === false, 'A used id is not.');
});

test("getByIds skips ids that are not present.", function() {
    const collection = new myt.BaseModelCollection();
    collection.addModel({id:'a'});
    collection.addModel({id:'b'});
    deepEqual(collection.getByIds(['a','nope','b']).map(model => model.id), ['a','b'], 'Missing ids are skipped.');
    deepEqual(collection.getByIds(null), [], 'A falsy argument gives an empty array.');
});

test("getAll returns the live store unless a copy is requested.", function() {
    const collection = new myt.BaseModelCollection();
    collection.addModel({id:'a'});
    const live = collection.getAll(),
        copy = collection.getAll(true);
    ok(live !== copy, 'The copy is a different object.');
    deepEqual(Object.keys(copy), ['a'], 'The copy has the same contents.');
    
    collection.addModel({id:'b'});
    ok(Object.keys(live).length === 2, 'The live object reflects later additions.');
    ok(Object.keys(copy).length === 1, 'The copy does not.');
});

test("getCount and getAsList with and without a filter.", function() {
    const collection = new myt.BaseModelCollection();
    collection.addModel({id:'a'});
    collection.addModel({id:'b'});
    
    ok(collection.getCount() === 2, 'Counts everything.');
    ok(collection.getCount(model => model.id === 'a') === 1, 'Counts only matches.');
    ok(collection.getAsList().length === 2, 'Lists everything.');
    deepEqual(collection.getAsList(model => model.id === 'b').map(model => model.id), ['b'], 'Lists only matches.');
});

test("getAsSortedList sorts and filters.", function() {
    const collection = new myt.BaseModelCollection();
    collection.addModel({id:'a'});
    collection.addModel({id:'b'});
    collection.addModel({id:'c'});
    
    const descending = (x, y) => y.id.localeCompare(x.id);
    deepEqual(collection.getAsSortedList(descending).map(model => model.id), ['c','b','a'], 'Sorted.');
    deepEqual(
        collection.getAsSortedList(descending, model => model.id !== 'b').map(model => model.id),
        ['c','a'],
        'Sorted and filtered.'
    );
    ok(collection.getAsSortedList().length === 3, 'No sort function still returns the list.');
});

test("getFirst returns the first model, optionally matching a filter.", function() {
    const collection = new myt.BaseModelCollection();
    collection.addModel({id:'a'});
    collection.addModel({id:'b'});
    
    ok(collection.getFirst().id === 'a', 'The first model.');
    ok(collection.getFirst(model => model.id === 'b').id === 'b', 'The first match.');
    ok(collection.getFirst(() => false) === undefined, 'Undefined when nothing matches.');
});

// BaseModelCollection: removal ////////////////////////////////////////////////
test("removeById returns the removed model.", function() {
    const collection = new myt.BaseModelCollection(),
        model = collection.addModel({id:'a'});
    ok(collection.removeById('a') === model, 'The removed model comes back.');
    ok(collection.getCount() === 0, 'It is gone from the collection.');
    ok(collection.removeById('nope') === undefined, 'Removing a missing id returns undefined.');
});

test("removeById only destroys the model when asked to.", function() {
    const collection = new myt.BaseModelCollection(),
        kept = collection.addModel({id:'a'});
    collection.removeById('a');
    ok(!kept.destroyed, 'Not destroyed by default.');
    
    const destroyed = collection.addModel({id:'b'});
    collection.removeById('b', true);
    ok(destroyed.destroyed === true, 'Destroyed when destructive is true.');
});

test("removeAll empties the collection.", function() {
    const collection = new myt.BaseModelCollection(),
        model = collection.addModel({id:'a'});
    collection.addModel({id:'b'});
    collection.removeAll();
    ok(collection.getCount() === 0, 'Everything was removed.');
    ok(!model.destroyed, 'Models are not destroyed by default.');
});

test("removeAll destroys the models when destructive.", function() {
    const collection = new myt.BaseModelCollection(),
        model = collection.addModel({id:'a'});
    collection.removeAll(true);
    ok(collection.getCount() === 0, 'Everything was removed.');
    ok(model.destroyed === true, 'The model was destroyed.');
});

test("Destroying a collection destroys the models it holds.", function() {
    const collection = new myt.BaseModelCollection(),
        model = collection.addModel({id:'a'});
    collection.destroy();
    ok(model.destroyed === true, 'The model was destroyed with the collection.');
});

// BaseModelCollection: setId //////////////////////////////////////////////////
test("setId sets the id when the model is not in a collection.", function() {
    const model = new myt.BaseModel({id:'a'});
    model.setId('b');
    ok(model.id === 'b', 'The id changed.');
});

test("setId is ignored while the model is in a collection.", function() {
    const collection = new myt.BaseModelCollection(),
        model = collection.addModel({id:'a'});
    model.setId('b');
    ok(model.id === 'a', 'The id did not change.');
    ok(collection.getById('a') === model, 'It is still stored under the original id.');
    ok(collection.getById('b') === undefined, 'Nothing was stored under the new id.');
});

test("A collision cannot displace an existing model.", function() {
    const collection = new myt.BaseModelCollection(),
        first = collection.addModel({id:'a'}),
        second = collection.addModel({id:'b'});
    first.setId('b');
    ok(first.id === 'a', 'The rename was refused.');
    ok(collection.getById('b') === second, 'The existing model is untouched.');
    ok(collection.getCount() === 2, 'Both models are still in the collection.');
});

test("removeById detaches the model so it can be rekeyed and re-added.", function() {
    const collection = new myt.BaseModelCollection(),
        model = collection.addModel({id:'a'});
    collection.removeById('a');
    ok(model.__mc === null, 'The collection reference was cleared.');
    
    model.setId('a2');
    ok(model.id === 'a2', 'A detached model can be rekeyed.');
    
    collection.addModel(model);
    ok(collection.getById('a2') === model, 'And re-added under the new id.');
});

test("A removed model no longer notifies its old collection.", function() {
    const collection = new myt.BaseModelCollection(),
        model = collection.addModel({id:'a'}),
        observer = new myt.Eventable(),
        fired = [];
    observer.onUpdated = event => {fired.push('updated:' + event.value.id);};
    observer.attachTo(collection, 'onUpdated', 'updated');
    
    collection.removeById('a');
    model.setAndNotifyCollection('id', 'zzz');
    deepEqual(fired, [], 'Nothing fired on the collection it left.');
});
