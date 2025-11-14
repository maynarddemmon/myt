module('Node Placement');

test("Test some simple default placements.", function() {
    var DefaultPlacementTestClass = new JS.Class('DefaultPlacementTestClass', myt.Node, {
        initNode: function(parent, attrs) {
            this.callSuper(parent, attrs);
            
            new myt.Node(this, {name:'foo'});
            new myt.Node(this, {name:'bar'});
            new myt.Node(this, {name:'baz'});
        }
    });
    
    var n = new DefaultPlacementTestClass();
    
    ok(n != null, "New DefaultPlacementTestClass instance exists");
    ok(n.subnodes.length === 3, "Instance should have three subnodes but instead has: " + n.subnodes.length);
    ok(n.foo.name === 'foo', "Child with name 'foo' exists.");
    ok(n.bar.name === 'bar', "Child with name 'bar' exists.");
    ok(n.baz.name === 'baz', "Child with name 'baz' exists.");
    
    new myt.Node(n, {name:'biz'});
    ok(n.biz.name === 'biz', "Child with name 'biz' exists.");
    
    new myt.Node(n, {name:'buz', placement:'bar'});
    ok(n.bar.buz.name === 'buz', "Grandchild with name 'buz' exists.");
    
    // Test that * works the same as empty defaultPlacement
    n.setDefaultPlacement('*');
    
    new myt.Node(n, {name:'bizz'});
    ok(n.bizz.name === 'bizz', "Child with name 'bizz' exists.");
    
    new myt.Node(n, {name:'buzz', placement:'bar'});
    ok(n.bar.buzz.name === 'buzz', "Grandchild with name 'buzz' exists.");
    
    // IgnorePlacement wins over placement
    new myt.Node(n, {name:'igbuzz', placement:'bar', ignorePlacement:true});
    ok(n.igbuzz.name === 'igbuzz', "Child with name 'igbuzz' exists.");
    
    n.destroy();
});

test("Test various placement options", function() {
    var DefaultPlacementTestClass = new JS.Class('DefaultPlacementTestClass', myt.Node, {
        initNode: function(parent, attrs) {
            attrs.defaultPlacement = 'bar';
            this.callSuper(parent, attrs);
            
            new myt.Node(this, {name:'foo'}); // No bar will exist yet so 'this' is used.
            new myt.Node(this, {name:'bar'}); // bar now exists but 'this' was used for bar.
            new myt.Node(this, {name:'baz'}); // bar exists so this should get put inside it.
            new myt.Node(this, {name:'biz', ignorePlacement:true}); // biz ignores placement.
            new myt.Node(this, {name:'buz', placement:'bar.baz'}); // Should be placed inside bar.baz
            new myt.Node(this, {name:'def', placement:'*'}); // * means use default placement
        }
    });
    
    var n = new DefaultPlacementTestClass();
    
    ok(n != null, "New DefaultPlacementTestClass instance exists");
    ok(n.subnodes.length === 3, "Instance should have three subnodes but instead has: " + n.subnodes.length);
    ok(n.foo.name === 'foo', "Child with name 'foo' exists.");
    ok(n.bar.name === 'bar', "Child with name 'bar' exists.");
    ok(n.bar.baz.name === 'baz', "Grandchild with name 'baz' exists.");
    ok(n.biz.name === 'biz', "Child with name 'biz' exists.");
    ok(n.bar.baz.buz.name === 'buz', "Great Grandchild with name 'buz' exists.");
    ok(n.bar.def.name === 'def', "Grandchild with name 'def' exists.");
    
    // Make another instance inside the existing one.
    // var inner = new DefaultPlacementTestClass(n, {name:'inner'});
    
    ok(n.bar.inner.bar.name === 'bar', "Inner instance has a bar.");
    
    // Verify that updated defaultPlacement works. Also tests * placement.
    n.setDefaultPlacement('bar.inner.*');
    new myt.Node(n, {name:'deep'});
    
    ok(n.bar.inner.bar.deep.name === 'deep', "Deep node exists.");
    
    // Verify that placement gets evaluated at each class instance
    new myt.Node(n, {name:'deeper', placement:'bar.inner.*.baz'});
    ok(n.bar.inner.bar.baz.deeper.name === 'deeper', "Deeper node exists.");
    
    new myt.Node(n, {name:'deeperAlt', placement:'*.baz'});
    ok(n.bar.inner.bar.baz.deeperAlt.name === 'deeperAlt', "Deeper alt node exists.");
    
    // When too many * are provided it should ignore the extra *s.
    new myt.Node(n, {name:'tooMany', placement:'*.*.*.*.*.*'});
    ok(n.bar.inner.bar.tooMany.name === 'tooMany', "tooMany node exists.");
    
    n.destroy();
});

test("Test setParent with defaultPlacement/placement.", function() {
    var DefaultPlacementTestClass = new JS.Class('DefaultPlacementTestClass', myt.Node, {
        initNode: function(parent, attrs) {
            attrs.defaultPlacement = 'bar';
            this.callSuper(parent, attrs);
            
            new myt.Node(this, {name:'foo'}); // No bar will exist yet so 'this' is used.
            new myt.Node(this, {name:'bar'}); // bar now exists but 'this' was used for bar.
            new myt.Node(this, {name:'baz'}); // bar exists so this should get put inside it.
        }
    });
    
    var n = new DefaultPlacementTestClass();
    
    ok(n != null, "New DefaultPlacementTestClass instance exists");
    ok(n.subnodes.length === 2, "Instance should have three subnodes but instead has: " + n.subnodes.length);
    ok(n.foo.name === 'foo', "Child with name 'foo' exists.");
    ok(n.bar.name === 'bar', "Child with name 'bar' exists.");
    ok(n.bar.baz.name === 'baz', "Grandchild with name 'baz' exists.");
    
    var orphan = new myt.Node(null, {name:'orphan'});
    orphan.setParent(n);
    
    ok(n.bar.orphan.name === 'orphan', "Grandchild with name 'orphan' exists.");
    
    n.destroy();
});

