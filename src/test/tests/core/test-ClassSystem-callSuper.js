/*  Tests for callSuper in the JS.Class system.
    
    The existing "Super calls" test in test-ClassSystem.js covers the basic case.
    These cover the parts that are easy to break without noticing: how far up the
    chain calls travel, how arguments are forwarded when callSuper is given fewer
    of them than the method received, and how mixins sit between a class and its
    parent. */
module('Class System - callSuper');

test("callSuper travels the whole ancestor chain.", function() {
    const grandparent = new JS.Class('SuperGrandparent', {
            initialize:function() {},
            who:function() {return 'gp';}
        }),
        parent = new JS.Class('SuperParent', grandparent, {
            who:function() {return 'p>' + this.callSuper();}
        }),
        child = new JS.Class('SuperChild', parent, {
            who:function() {return 'c>' + this.callSuper();}
        });
    
    ok(new child().who() === 'c>p>gp', 'Each level was visited in order.');
    ok(new parent().who() === 'p>gp', 'Starting partway down the chain still works.');
});

test("callSuper is only defined while a super call is possible.", function() {
    const base = new JS.Class('SuperBase', {
            initialize:function() {},
            probe:function() {return typeof this.callSuper;}
        }),
        sub = new JS.Class('SuperSub', base, {
            probe:function() {return typeof this.callSuper + ',' + this.callSuper();}
        }),
        inst = new sub();
    
    ok(inst.probe() === 'function,undefined', 'Defined in the override, gone once the base runs.');
    ok(inst.callSuper === undefined, 'Not left behind on the instance afterwards.');
});

test("callSuper with no arguments forwards the original ones.", function() {
    const base = new JS.Class('SuperArgsBase', {
            initialize:function() {},
            join:function(a, b) {return a + '/' + b;}
        }),
        sub = new JS.Class('SuperArgsSub', base, {
            join:function(_a, _b) {return 'sub:' + this.callSuper();}
        });
    
    ok(new sub().join('x', 'y') === 'sub:x/y', 'Both original arguments reached the parent.');
});

test("callSuper with some arguments keeps the rest of the originals.", function() {
    // Any trailing arguments the caller does not supply are filled in from the
    // arguments the overriding method was called with.
    const base = new JS.Class('SuperPartialBase', {
            initialize:function() {},
            join:function(a, b, c) {return a + '/' + b + '/' + c;}
        }),
        sub = new JS.Class('SuperPartialSub', base, {
            join:function(_a, _b, _c) {return this.callSuper('X');}
        });
    
    ok(new sub().join('x', 'y', 'z') === 'X/y/z', 'The supplied argument replaced only the first.');
});

test("callSuper passes through return values.", function() {
    const base = new JS.Class('SuperReturnBase', {
            initialize:function() {},
            num:function() {return 21;}
        }),
        sub = new JS.Class('SuperReturnSub', base, {
            num:function() {return this.callSuper() * 2;}
        });
    
    ok(new sub().num() === 42, 'The parent return value was usable.');
});

test("callSuper works in an initializer.", function() {
    const base = new JS.Class('SuperInitBase', {
            initialize:function(v) {this.trail = 'base:' + v;}
        }),
        sub = new JS.Class('SuperInitSub', base, {
            initialize:function(v) {
                this.callSuper(v);
                this.trail = 'sub(' + this.trail + ')';
            }
        });
    
    ok(new sub('x').trail === 'sub(base:x)', 'The parent initializer ran first.');
});

test("A mixin method can callSuper into the class it is mixed into.", function() {
    const base = new JS.Class('SuperMixinBase', {
            initialize:function() {},
            who:function() {return 'base';}
        }),
        mixin = new JS.Module('SuperMixin', {
            who:function() {return 'mix>' + this.callSuper();}
        }),
        klass = new JS.Class('SuperMixinClass', base, {include:[mixin]});
    
    ok(new klass().who() === 'mix>base', 'The mixin sits between the class and its parent.');
});

test("A class method takes precedence over a mixin and can callSuper into it.", function() {
    const base = new JS.Class('SuperOrderBase', {
            initialize:function() {},
            who:function() {return 'base';}
        }),
        mixin = new JS.Module('SuperOrderMixin', {
            who:function() {return 'mix>' + this.callSuper();}
        }),
        klass = new JS.Class('SuperOrderClass', base, {
            include:[mixin],
            who:function() {return 'own>' + this.callSuper();}
        });
    
    ok(new klass().who() === 'own>mix>base', 'Own method, then mixin, then parent.');
});

test("With two mixins defining the same method the last one included wins.", function() {
    const first = new JS.Module('SuperTwoFirst', {tag:function() {return 'first';}}),
        second = new JS.Module('SuperTwoSecond', {tag:function() {return 'second';}}),
        klass = new JS.Class('SuperTwoClass', {include:[first, second], initialize:function() {}});
    
    ok(new klass().tag() === 'second', 'The later mixin shadows the earlier one.');
});

test("A later mixin can callSuper into an earlier one.", function() {
    const first = new JS.Module('SuperChainFirst', {tag:function() {return 'first';}}),
        second = new JS.Module('SuperChainSecond', {tag:function() {return 'second>' + this.callSuper();}}),
        klass = new JS.Class('SuperChainClass', {include:[first, second], initialize:function() {}});
    
    ok(new klass().tag() === 'second>first', 'Mixins chain in include order.');
});

test("Super calls", function() {
    const classOne = new JS.Class('ClassOne', {
            initialize: function(v1, v2) {
                this.fieldOne = 'foo';
                this.fieldTwo = v1;
                this.fieldThree = v2;
            },
            
            methodOne: function(v) {
                return 'bar' + v;
            }
        }),
        classTwo = new JS.Class('ClassTwo', classOne, {
            initialize: function(v1, v2) {
                this.fieldOneChild = 'bar';
                this.fieldTwoChild = v1;
                this.fieldThreeChild = v2;
                
                this.callSuper(v1, v2);
            },
            
            methodOne: function(v) {
                return 'foo' + this.callSuper(v);
            }
        }),
        inst = new classTwo('hey','you');
    ok(inst.fieldOne === 'foo', 'The constructor got run.');
    ok(inst.fieldTwo === 'hey', 'The constructor passed in at least the first arg.');
    ok(inst.fieldThree === 'you', 'The constructor passed in two args.');
    
    ok(inst.fieldOneChild === 'bar', 'The constructor got run.');
    ok(inst.fieldTwoChild === 'hey', 'The constructor passed in at least the first arg.');
    ok(inst.fieldThreeChild === 'you', 'The constructor passed in two args.');
    
    ok(inst.methodOne('x') === 'foobarx', 'The method exists.');
});

test("callSuper works when the parent is a native ES6 class.", function() {
    const ES6Parent = eval("(class ES6Parent { greet() {return 'parent';} })"),
        sub = new JS.Class('ES6Sub', ES6Parent, {
            initialize: function() {},
            greet: function() {return 'sub->' + this.callSuper();}
        }),
        inst = new sub();
    ok(inst instanceof ES6Parent, 'Is an instance of the ES6 parent.');
    ok(typeof inst.callSuper === 'undefined', 'callSuper is not exposed outside a super call.');
    ok(inst.greet() === 'sub->parent', 'callSuper reached the ES6 prototype method.');
});
