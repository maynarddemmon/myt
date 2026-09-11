/*  A BaseModelCollection can hold models of more than one JS.Class by setting
    modelClass to something all of them share, either a common base class or a
    marker mixin, and overriding createModel to pick the concrete class per
    record.
    
    This is an exotic setup, but it depends on two things that are easy to break
    by accident: addModel must route new instances through createModel rather
    than constructing modelClass itself, and isA(modelClass) must work when
    modelClass is a JS.Module. These tests exist to catch that. */
module('ModelMixins polymorphic');

/*  The classes are built once and shared, the way a real application would have
    them, so that separate collections agree about what Storable means. Only the
    collection is rebuilt per test. */
const Storable = new JS.Module('Storable', {}),
    FooClass = new JS.Class('FooClass', myt.BaseModel, {
        include: [Storable],
        getAsObj: function() {return {id:this.id, kind:this.kind, foo:this.foo};},
        setKind: function(v) {this.set('kind', v, true);},
        setFoo: function(v) {this.set('foo', v, true);}
    }),
    BarClass = new JS.Class('BarClass', myt.BaseModel, {
        include: [Storable],
        getAsObj: function() {return {id:this.id, kind:this.kind, bar:this.bar};},
        setKind: function(v) {this.set('kind', v, true);},
        setBar: function(v) {this.set('bar', v, true);}
    }),
    PolymorphicCollection = new JS.Class('PolymorphicCollection', myt.BaseModelCollection, {
        createModel: function(attrs={}) {
            attrs.modelCollection = this;
            let klass;
            switch (attrs.kind) {
                case 'foo':
                    klass = FooClass;
                    break;
                case 'bar':
                    klass = BarClass;
                    break;
                default:
                    // Assuming this.modelClass is not a mixin or abstract base class.
                    klass = this.modelClass;
            }
            return new klass(attrs);
        }
    }),
    
    makeCollection = () => new PolymorphicCollection({modelClass:Storable});

test("isA works with a JS.Module so a mixin can be used as modelClass.", function() {
    const foo = new FooClass({id:'f', kind:'foo'}),
        unrelated = new myt.BaseModel({id:'u'});
    ok(foo.isA(Storable) === true, 'A class that includes the mixin matches.');
    ok(unrelated.isA(Storable) === false, 'A class that does not include it does not match.');
});

test("addModel routes new instances through createModel.", function() {
    // If addModel ever constructs modelClass directly instead of calling
    // createModel, this fails, and with a mixin as modelClass it would throw
    // "this.modelClass is not a constructor".
    const collection = makeCollection(),
        foo = collection.addModel({id:'f1', kind:'foo', foo:'a'}),
        bar = collection.addModel({id:'b1', kind:'bar', bar:'z'});
    
    ok(foo.isA(FooClass), 'The foo record became a FooClass.');
    ok(bar.isA(BarClass), 'The bar record became a BarClass.');
    ok(collection.getCount() === 2, 'Both are in the collection.');
    ok(collection.getById('f1') === foo, 'The foo model is stored under its id.');
    ok(collection.getById('b1') === bar, 'The bar model is stored under its id.');
});

test("Models built by an overridden createModel are wired into the collection.", function() {
    const collection = makeCollection(),
        model = collection.addModel({id:'f1', kind:'foo', foo:'a'});
    ok(model.__mc === collection, 'The backreference was set.');
    ok(model.id === 'f1', 'The id was set.');
    ok(model.foo === 'a', 'Subclass specific attrs were set.');
});

test("A polymorphic collection updates existing models in place.", function() {
    const collection = makeCollection(),
        first = collection.addModel({id:'f1', kind:'foo', foo:'a'}),
        again = collection.addModel({id:'f1', kind:'foo', foo:'b'});
    
    ok(again === first, 'The existing instance was updated, not replaced.');
    ok(first.foo === 'b', 'The new value was applied.');
    ok(first.isA(FooClass), 'It is still the right class.');
    ok(collection.getCount() === 1, 'Still one model.');
});

test("An unchanged re-add fires no event in a polymorphic collection.", function() {
    const collection = makeCollection(),
        observer = new myt.Eventable(),
        fired = [];
    collection.addModel({id:'f1', kind:'foo', foo:'a'});
    
    observer.onAny = event => {fired.push(event.type);};
    observer.attachTo(collection, 'onAny', 'added');
    observer.attachTo(collection, 'onAny', 'updated');
    
    collection.addModel({id:'f1', kind:'foo', foo:'a'});
    deepEqual(fired, [], 'Nothing fired.');
});

test("A model instance of any member class can be added directly.", function() {
    const collection = makeCollection(),
        bar = new BarClass({id:'b1', kind:'bar', bar:'z'});
    
    ok(bar.__mc === undefined, 'It starts detached.');
    collection.addModel(bar);
    ok(collection.getById('b1') === bar, 'The instance itself was stored.');
    ok(bar.__mc === collection, 'It is now owned by the collection.');
});

test("The ownership guard still applies when modelClass is a mixin.", function() {
    // attrsAreModel is isA(modelClass), so with a mixin every member class
    // satisfies it and the cross collection check still runs.
    const first = makeCollection(),
        second = makeCollection(),
        model = first.addModel({id:'f1', kind:'foo', foo:'a'}),
        originalWarn = console.warn,
        captured = [];
    
    console.warn = (...args) => {captured.push(args.map(String).join(' '));};
    try {
        second.addModel(model);
    } finally {
        console.warn = originalWarn;
    }
    
    ok(captured.length === 1, 'The add was refused with a warning. Got ' + captured.length + '.');
    ok(first.getById('f1') === model, 'The original collection keeps it.');
    ok(second.getCount() === 0, 'The second collection did not take it.');
});

test("The default branch of an overridden createModel still works.", function() {
    // Records with no recognized kind fall through to this.modelClass, which is
    // only constructible when modelClass is a real class rather than a mixin.
    const ConcreteBase = new JS.Class('ConcreteBase', myt.BaseModel, {
            setKind: function(v) {this.set('kind', v, true);}
        }),
        Fallback = new JS.Class('Fallback', myt.BaseModelCollection, {
            createModel: function(attrs={}) {
                attrs.modelCollection = this;
                return new this.modelClass(attrs);
            }
        }),
        collection = new Fallback({modelClass:ConcreteBase}),
        model = collection.addModel({id:'x', kind:'unrecognized'});
    
    ok(model.isA(ConcreteBase), 'It was built from modelClass.');
    ok(collection.getById('x') === model, 'And stored.');
});