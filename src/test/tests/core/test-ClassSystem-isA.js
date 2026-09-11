module('Class System - .isA');

test("isA matches a class and its ancestors.", function() {
    const base = new JS.Class('IsABase', {initialize:function() {}}),
        mid = new JS.Class('IsAMid', base, {}),
        leaf = new JS.Class('IsALeaf', mid, {}),
        unrelated = new JS.Class('IsAUnrelated', {initialize:function() {}}),
        inst = new leaf();
    
    ok(inst.isA(leaf) === true, 'Its own class.');
    ok(inst.isA(mid) === true, 'Its parent.');
    ok(inst.isA(base) === true, 'Its grandparent.');
    ok(inst.isA(unrelated) === false, 'An unrelated class.');
    ok(new unrelated().isA(base) === false, 'The check is not symmetric.');
    ok(inst.isA(Object) === true, 'Object, which every class descends from.');
});

test("isA matches an included JS.Module.", function() {
    // This is what lets a mixin stand in for a class as a marker, for example as
    // the modelClass of a BaseModelCollection holding several model classes.
    const mixin = new JS.Module('IsAMixin', {}),
        klass = new JS.Class('IsAWithMixin', {include:[mixin], initialize:function() {}}),
        without = new JS.Class('IsAWithoutMixin', {initialize:function() {}});
    
    ok(new klass().isA(mixin) === true, 'A class that includes the module matches.');
    ok(new without().isA(mixin) === false, 'A class that does not include it does not match.');
});

test("isA matches modules included transitively and through a parent.", function() {
    const inner = new JS.Module('IsAInner', {}),
        outer = new JS.Module('IsAOuter', {include:[inner]}),
        viaModule = new JS.Class('IsAViaModule', {include:[outer], initialize:function() {}});
    
    ok(new viaModule().isA(outer) === true, 'The directly included module.');
    ok(new viaModule().isA(inner) === true, 'A module included by that module.');
    
    const parent = new JS.Class('IsAModuleParent', {include:[inner], initialize:function() {}}),
        child = new JS.Class('IsAModuleChild', parent, {});
    ok(new child().isA(inner) === true, 'A module included by an ancestor class.');
});

test("isA reflects a module included after instances already exist.", function() {
    const klass = new JS.Class('IsALate', {initialize:function() {}}),
        existing = new klass(),
        mixin = new JS.Module('IsALateMixin', {});
    
    ok(existing.isA(mixin) === false, 'Not a match before the module is included.');
    klass.include(mixin);
    ok(existing.isA(mixin) === true, 'An existing instance picks up the change.');
    ok(new klass().isA(mixin) === true, 'So does a new instance.');
});

test("isA reflects a module added to a single instance.", function() {
    const klass = new JS.Class('IsAExtend', {initialize:function() {}}),
        extended = new klass(),
        sibling = new klass(),
        mixin = new JS.Module('IsAExtendMixin', {});
    
    extended.extend(mixin);
    ok(extended.isA(mixin) === true, 'The extended instance matches.');
    ok(sibling.isA(mixin) === false, 'Another instance of the same class does not.');
});

test("isA compares modules by identity, not by name.", function() {
    // Two modules built with the same name are still different objects, so code
    // that uses a mixin as a marker has to share the one instance.
    const included = new JS.Module('IsASameName', {}),
        lookalike = new JS.Module('IsASameName', {}),
        klass = new JS.Class('IsAIdentity', {include:[included], initialize:function() {}}),
        inst = new klass();
    
    ok(inst.isA(included) === true, 'The module that was actually included.');
    ok(inst.isA(lookalike) === false, 'A separate module with the same name.');
});

test("isA returns false for values that are not classes or modules.", function() {
    const klass = new JS.Class('IsANonClass', {initialize:function() {}}),
        inst = new klass();
    
    ok(inst.isA(null) === false, 'Null.');
    ok(inst.isA(undefined) === false, 'Undefined.');
    ok(inst.isA({}) === false, 'A plain object.');
});

test("Classes and modules are themselves instances of JS.Class and JS.Module.", function() {
    const klass = new JS.Class('IsAMetaClass', {initialize:function() {}}),
        mixin = new JS.Module('IsAMetaModule', {});
    
    ok(klass.isA(JS.Class) === true, 'A class is a JS.Class.');
    ok(mixin.isA(JS.Module) === true, 'A module is a JS.Module.');
});
