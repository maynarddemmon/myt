module('Class System');

test("Create a class, subclass and verify instanceof works.", function() {
    var classA = new JS.Class('ClassA');
    var classB = new JS.Class('ClassB', Object);
    var classC = new JS.Class('ClassC', classB);
    
    var instA = new classA();
    ok(instA != null, "instA exists");
    ok(instA instanceof classA, "Is an instance of classA");
    ok(!(instA instanceof classB), "Is not an instance of classB");
    
    var instB = new classB();
    ok(instB != null, "instB exists");
    ok(instB instanceof classB, "Is an instance of classB");
    ok(!(instB instanceof classC), "Is not an instance of classC");
    
    var instC = new classC();
    ok(instC != null, "instC exists");
    ok(instC instanceof classC, "Is an instance of classC");
    ok(instC instanceof classB, "Is an instance of classB through subclassing");
});

test("Verify empty initializer gets run and methods exist.", function() {
    var classOne = new JS.Class('ClassOne', {
        initialize: function() {
            this.fieldOne = 'foo';
        },
        
        methodOne: function(v) {
            return 'bar' + v;
        }
    });
    
    var inst = new classOne();
    ok(inst.fieldOne === 'foo', 'The constructor got run.');
    ok(inst.methodOne('x') === 'barx', 'The method exists.');
});

test("Verify initializer with arguments gets run.", function() {
    var classTwo = new JS.Class('ClassTwo', {
        initialize: function(v1, v2) {
            this.fieldOne = 'foo';
            this.fieldTwo = v1;
            this.fieldThree = v2;
        }
    });
    
    var inst = new classTwo('hey','you');
    ok(inst.fieldOne === 'foo', 'The constructor got run.');
    ok(inst.fieldTwo === 'hey', 'The constructor passed in at least the first arg.');
    ok(inst.fieldThree === 'you', 'The constructor passed in two args.');
});

test("Super calls", function() {
    var classOne = new JS.Class('ClassOne', {
        initialize: function(v1, v2) {
            this.fieldOne = 'foo';
            this.fieldTwo = v1;
            this.fieldThree = v2;
        },
        
        methodOne: function(v) {
            return 'bar' + v;
        }
    });
    
    var classTwo = new JS.Class('ClassTwo', classOne, {
        initialize: function(v1, v2) {
            this.fieldOneChild = 'bar';
            this.fieldTwoChild = v1;
            this.fieldThreeChild = v2;
            
            this.callSuper(v1, v2);
        },
        
        methodOne: function(v) {
            return 'foo' + this.callSuper(v);
        }
    });
    
    var inst = new classTwo('hey','you');
    ok(inst.fieldOne === 'foo', 'The constructor got run.');
    ok(inst.fieldTwo === 'hey', 'The constructor passed in at least the first arg.');
    ok(inst.fieldThree === 'you', 'The constructor passed in two args.');
    
    ok(inst.fieldOneChild === 'bar', 'The constructor got run.');
    ok(inst.fieldTwoChild === 'hey', 'The constructor passed in at least the first arg.');
    ok(inst.fieldThreeChild === 'you', 'The constructor passed in two args.');
    
    ok(inst.methodOne('x') === 'foobarx', 'The method exists.');
});

test("Create a singleton.", function() {
    var sing = new JS.Singleton('SingOne', {
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
    var mixinOne = new JS.Module('MixinOne', {
        methodTwo: function(v) {
            return 'baz' + v;
        }
    });
    
    var classOne = new JS.Class('ClassOne', {
        include: [mixinOne],
        
        initialize: function() {
            this.fieldOne = 'foo';
        },
        
        methodOne: function(v) {
            return 'bar' + v;
        }
    });
    
    var inst = new classOne();
    ok(inst.fieldOne === 'foo', 'The constructor got run.');
    ok(inst.methodOne('x') === 'barx', 'The method exists.');
    ok(inst.methodTwo('x') === 'bazx', 'The mixin method exists.');
});
