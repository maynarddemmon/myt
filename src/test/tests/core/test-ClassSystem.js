module('Class System');

test("Create a class, subclass and verify instanceof works.", function() {
    const classA = new JS.Class('ClassA', Object, {initialize:function() {}}),
        classB = new JS.Class('ClassB', Object, {initialize:() => {}}),
        classC = new JS.Class('ClassC', classB),
        instA = new classA();
    ok(instA != null, "instA exists");
    ok(instA instanceof classA, "Is an instance of classA");
    ok(!(instA instanceof classB), "Is not an instance of classB");
    
    const instB = new classB();
    ok(instB != null, "instB exists");
    ok(instB instanceof classB, "Is an instance of classB");
    ok(!(instB instanceof classC), "Is not an instance of classC");
    
    const instC = new classC();
    ok(instC != null, "instC exists");
    ok(instC instanceof classC, "Is an instance of classC");
    ok(instC instanceof classB, "Is an instance of classB through subclassing");
});

test("Verify empty initializer gets run and methods exist.", function() {
    const classOne = new JS.Class('ClassOne', {
            initialize: function() {
                this.fieldOne = 'foo';
            },
            
            methodOne: function(v) {
                return 'bar' + v;
            }
        }),
        inst = new classOne();
    ok(inst.fieldOne === 'foo', 'The constructor got run.');
    ok(inst.methodOne('x') === 'barx', 'The method exists.');
});

test("Verify initializer with arguments gets run.", function() {
    const classTwo = new JS.Class('ClassTwo', {
            initialize: function(v1, v2) {
                this.fieldOne = 'foo';
                this.fieldTwo = v1;
                this.fieldThree = v2;
            }
        }),
        inst = new classTwo('hey','you');
    ok(inst.fieldOne === 'foo', 'The constructor got run.');
    ok(inst.fieldTwo === 'hey', 'The constructor passed in at least the first arg.');
    ok(inst.fieldThree === 'you', 'The constructor passed in two args.');
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

test("Create a singleton.", function() {
    const sing = new JS.Singleton('SingOne', {
        initialize: function() {
            this.fieldOne = 'foo';
        },
        
        methodOne: function(v) {
            return 'bar' + v;
        }
    });
    
    ok(sing.fieldOne === 'foo', 'The constructor got run.');
    ok(sing.methodOne('x') === 'barx', 'The method exists.');
});

test("Add a mixin (module)", function() {
    const mixinOne = new JS.Module('MixinOne', {
            methodTwo: function(v) {
                return 'baz' + v;
            }
        }),
        classOne = new JS.Class('ClassOne', {
            include: [mixinOne],
            
            initialize: function() {
                this.fieldOne = 'foo';
            },
            
            methodOne: function(v) {
                return 'bar' + v;
            }
        }),
        inst = new classOne();
    ok(inst.fieldOne === 'foo', 'The constructor got run.');
    ok(inst.methodOne('x') === 'barx', 'The method exists.');
    ok(inst.methodTwo('x') === 'bazx', 'The mixin method exists.');
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

test("Inherited ES6 methods work without an override.", function() {
    const ES6Parent = eval("(class ES6Parent2 { greet() {return 'parent';} })"),
        sub = new JS.Class('ES6Sub2', ES6Parent, {initialize:function() {}});
    ok(new sub().greet() === 'parent', 'Inherited method is callable.');
});

test("An ES6 parent with a getter does not break class definition.", function() {
    const ES6Parent = eval("(class ES6Parent3 {" +
            "get boom() {throw new Error('getter invoked on prototype');}" +
            "greet() {return 'parent';}" +
        "})");
    
    let sub;
    try {
        sub = new JS.Class('ES6Sub3', ES6Parent, {
            initialize: function() {},
            greet: function() {return 'sub->' + this.callSuper();}
        });
    } catch (e) {
        ok(false, 'Defining the class threw: ' + e.message);
        return;
    }
    ok(sub != null, 'The class was defined despite the parent getter.');
    ok(new sub().greet() === 'sub->parent', 'callSuper still works.');
});

test("A getter in a class body keeps its historical behavior.", function() {
    let count = 0;
    const klass = new JS.Class('GetterBody', {
        initialize: function() {},
        get computed() {count++; return 'value';}
    });
    ok(count === 1, 'The getter is evaluated once at definition time.');
    ok(new klass().computed === 'value', 'The evaluated value is stored on the prototype.');
});
