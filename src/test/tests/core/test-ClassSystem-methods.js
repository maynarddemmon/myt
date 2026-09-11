/*  Tests for how methods get onto a class and which one wins when more than one
    source defines the same name.
    
    The precedence rule is the important part: methods declared directly on a
    class always beat methods from a module it includes, no matter when the
    module was included. That makes include a poor tool for patching an existing
    method, which is easy to get wrong. */
module('Class System - methods');

// Class level methods /////////////////////////////////////////////////////////
test("extend in a class body defines class level members.", function() {
    const klass = new JS.Class('ExtendClass', {
        extend: {
            LIMIT: 42,
            build: function() {return 'built';}
        },
        initialize:function() {}
    });
    
    ok(klass.LIMIT === 42, 'A class level value.');
    ok(klass.build() === 'built', 'A class level method.');
    ok(new klass().LIMIT === undefined, 'Class level members are not on instances.');
});

test("Class level members are inherited by subclasses.", function() {
    const parent = new JS.Class('ExtendParent', {
            extend: {LIMIT:42, build:function() {return 'built';}},
            initialize:function() {}
        }),
        child = new JS.Class('ExtendChild', parent, {});
    
    ok(child.LIMIT === 42, 'An inherited class level value.');
    ok(child.build() === 'built', 'An inherited class level method.');
});

test("extend can be called on a class after it is defined.", function() {
    const klass = new JS.Class('ExtendLater', {initialize:function() {}});
    klass.extend({later:function() {return 'later';}});
    ok(klass.later() === 'later', 'The class level method was added.');
});

// Precedence //////////////////////////////////////////////////////////////////
test("A method on the class beats one from an included module.", function() {
    const mixin = new JS.Module('PrecedenceMixin', {tag:function() {return 'mixin';}}),
        klass = new JS.Class('PrecedenceClass', {
            include:[mixin],
            initialize:function() {},
            tag:function() {return 'class';}
        });
    
    ok(new klass().tag() === 'class', 'The class method wins.');
});

test("Including a module cannot replace a method the class already defines.", function() {
    /*  This is worth knowing before reaching for include to patch something.
        Resolution writes a module's methods onto the class first and the class's
        own methods after, so the class always ends up on top. Subclassing is the
        way to override an existing method. */
    const klass = new JS.Class('PatchTarget', {
            initialize:function() {},
            tag:function() {return 'original';}
        }),
        patch = new JS.Module('PatchModule', {tag:function() {return 'patched';}});
    
    klass.include(patch);
    ok(new klass().tag() === 'original', 'The original method is still in place.');
    
    const sub = new JS.Class('PatchSubclass', klass, {tag:function() {return 'sub>' + this.callSuper();}});
    ok(new sub().tag() === 'sub>original', 'A subclass can override it.');
});

test("A module can add a method the class does not already have.", function() {
    const klass = new JS.Class('AddTarget', {initialize:function() {}, a:function() {return 'a';}}),
        existing = new klass();
    
    klass.include(new JS.Module('AddModule', {b:function() {return 'b';}}));
    
    ok(existing.b() === 'b', 'An instance created earlier sees the new method.');
    ok(new klass().b() === 'b', 'So does a new instance.');
    ok(existing.a() === 'a', 'The original method is untouched.');
});

test("Redefining a name on the same module warns instead of silently replacing.", function() {
    // The first definition stays in place and the second is folded into a
    // generated module behind it, which keeps it reachable through callSuper.
    const klass = new JS.Class('DuplicateTarget', {initialize:function() {}}),
        originalWarn = console.warn,
        captured = [];
    
    console.warn = (...args) => {captured.push(args.map(String).join(' '));};
    try {
        klass.extend({dup:function() {return 'first>' + (this.callSuper ? this.callSuper() : 'none');}});
        klass.extend({dup:function() {return 'second';}});
    } finally {
        console.warn = originalWarn;
    }
    
    ok(captured.length === 1, 'One warning was emitted. Got ' + captured.length + '.');
    ok(klass.dup() === 'first>second', 'The first definition runs and can reach the second.');
});

// Metadata ////////////////////////////////////////////////////////////////////
test("Instances carry references back to their class.", function() {
    const klass = new JS.Class('MetaClass', {initialize:function() {}}),
        inst = new klass();
    
    ok(inst.klass === klass, 'The klass reference.');
    ok(inst.constructor === klass, 'The constructor reference.');
});

test("instanceMethod extracts a named method from a class.", function() {
    const klass = new JS.Class('ExtractClass', {
            initialize:function() {},
            go:function() {return 'went';}
        }),
        method = klass.instanceMethod('go');
    
    ok(method.name === 'go', 'The method knows its name.');
    ok(typeof method.callable === 'function', 'It carries the underlying function.');
    ok(method.callable.call({}) === 'went', 'Which can be invoked directly.');
});

test("includes reports whether a module is in a class's ancestry.", function() {
    const inner = new JS.Module('IncludesInner', {}),
        outer = new JS.Module('IncludesOuter', {include:[inner]}),
        klass = new JS.Class('IncludesClass', {include:[outer], initialize:function() {}}),
        unrelated = new JS.Module('IncludesUnrelated', {});
    
    ok(klass.includes(outer) === true, 'A directly included module.');
    ok(klass.includes(inner) === true, 'A transitively included module.');
    ok(klass.includes(unrelated) === false, 'A module that is not included.');
});

// Initializers ////////////////////////////////////////////////////////////////
test("A class with no initializer can still be instantiated through its parent.", function() {
    const parent = new JS.Class('NoInitParent', {initialize:function() {this.ran = true;}}),
        child = new JS.Class('NoInitChild', parent, {});
    
    ok(new child().ran === true, 'The inherited initializer ran.');
});

test("An initializer that returns an object replaces the new instance.", function() {
    // Construction is "return this.initialize(...) ?? this", so a returned
    // object is handed back instead of the instance being built.
    const replacing = new JS.Class('ReplacingInit', {initialize:function() {return {replaced:true};}}),
        normal = new JS.Class('NormalInit', {initialize:function() {return undefined;}});
    
    ok(new replacing().replaced === true, 'The returned object came back.');
    ok(new normal() instanceof normal, 'Returning undefined gives the real instance.');
});