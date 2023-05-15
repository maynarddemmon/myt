module('Node');

test("Create and destroy a myt.Node that has no parent", function() {
    var n = new myt.Node();
    
    ok(n != null, "New node exists");
    ok(n.parent === undefined, "New node has an undefined parent.");
    ok(n.inited === true, "The inited property of the new node is set to true.");
    ok(n.subnodes === undefined, "Subnodes are undefined since no child nodes were added.");
    ok(n.destroyed === undefined, "The destroyed property of the new node does not exist yet.");
    ok(n.get('parent') === undefined, "Calling the generic getter for 'parent' should return undefined.");
    ok(n.isRoot() === true, "The new node should think it's root since it's an orphan.");
    ok(n.getRoot() === n, "The new node should return itself as root.");
    
    var subs = n.getSubnodes();
    ok(subs != null, "Returned subnodes should exist after a call to getSubnodes");
    ok(n.subnodes != null, "Subnodes property should exist after a call to getSubnodes");
    ok(subs.length === 0, "Subnodes should be zero length since we have none");
    
    n.destroy();
    
    ok(n.destroyed === true, "The destroyed property of the new node should be true.");
    ok(Object.keys(n).length === 1, "All properties except 'destroyed' should be deleted.");
});

test("Add and remove child nodes on a root node", function() {
    var rootNode = new myt.Node();
    
    ok(rootNode != null, "Root node exists");
    ok(rootNode.subnodes === undefined, "Subnodes are undefined since no child nodes were added.");
    
    // Add a node directly to the root
    var childNode = new myt.Node(rootNode);
    
    ok(childNode != null, "Child node exists");
    ok(childNode.parent === rootNode, "Child node has rootNode as a parent.");
    ok(childNode.get('parent') === rootNode, "Calling the generic getter for 'parent' should return the root node.");
    ok(childNode.isRoot() === false, "Child node should not be a root.");
    ok(childNode.getRoot() === rootNode, "The root for the child should be the root node.");
    
    // Subnode tests
    ok(rootNode.subnodes != null, "Subnodes should now be defined on the root node.");
    ok(rootNode.subnodes.length === 1, "Subnodes should have a length of 1.");
    ok(rootNode.getSubnodes().indexOf(childNode) === 0, "Verify getSubnodes().indexOf(node) method works.");
    ok(rootNode.subnodes[0] === childNode, "The first subnode should be the child node.");
    ok(rootNode.getSubnodes().includes(childNode) === true, "Verify getSubnodes().includes(node) method works.");
    
    // Relationship tests
    ok(childNode.isDescendantOf(rootNode) === true, "Child node is a descendant of the root node.");
    ok(rootNode.isAncestorOf(childNode) === true, "Root node is an ancestor of the child node.");
    
    // Create another child independently and then reparent it using setParent
    var orphanNode = new myt.Node();
    
    ok(orphanNode.isRoot() === true, "Orphan node should be a root.");
    ok(orphanNode != null, "Orphan node exists");
    ok(rootNode.subnodes.length === 1, "Subnodes should still have a length of 1.");
    
    orphanNode.setParent(rootNode);
    
    ok(orphanNode.isRoot() === false, "Orphan node should no longer be a root.");
    ok(orphanNode.parent === rootNode, "Orphan node has rootNode as a parent.");
    ok(orphanNode.get('parent') === rootNode, "Calling the generic getter for 'parent' should return the root node.");
    ok(rootNode.subnodes.length === 2, "Subnodes should have a length of 2.");
    ok(rootNode.getSubnodes().indexOf(orphanNode) === 1, "Formerly orphaned node should have an index of 1.");
    
    // Call setParent on a node that is already a child should not change anything.
    ok(rootNode.getSubnodes().indexOf(childNode) === 0, "Verify index is still 0.");
    childNode.setParent(rootNode);
    ok(rootNode.getSubnodes().indexOf(childNode) === 0, "Verify index is again still 0.");
    ok(rootNode.getSubnodes().indexOf(orphanNode) === 1, "Orphan node index should still be 1.");
    ok(rootNode.subnodes.length === 2, "Subnodes should still have a length of 2.");
    
    // Create another child independently and then add it using setParent
    var orphanNode2 = new myt.Node();
    orphanNode2.setParent(rootNode);
    
    ok(orphanNode2.isRoot() === false, "Orphan node 2 should no longer be a root.");
    ok(orphanNode2.parent === rootNode, "Orphan node 2 has rootNode as a parent.");
    ok(orphanNode2.get('parent') === rootNode, "Calling the generic getter for 'parent' should return the root node.");
    ok(rootNode.subnodes.length === 3, "Subnodes should have a length of 3.");
    ok(rootNode.getSubnodes().indexOf(orphanNode2) === 2, "Formerly orphaned node 2 should have an index of 1.");
    
    // Remove the node using setParent
    orphanNode2.setParent();
    ok(orphanNode2.isRoot() === true, "Orphan node 2 should be a root now.");
    ok(rootNode.getSubnodes().indexOf(orphanNode2) === -1, "Index should be -1.");
    ok(rootNode.subnodes.length === 2, "Subnodes should now have a length of 2.");
    
    orphanNode2.destroy();
    
    // Create another child node and then destroy the first node we added
    var anotherChildNode = new myt.Node(rootNode);
    
    ok(rootNode.subnodes.length === 3, "Subnodes should have a length of 3.");
    
    childNode.destroy();
    
    ok(rootNode.subnodes.length === 2, "Subnodes should be back to a length of 2.");
    ok(childNode.destroyed === true, "The destroyed property of the child node should be true.");
    ok(Object.keys(childNode).length === 1, "All properties except 'destroyed' should be deleted on the child node.");
    
    // Destroy the root which should cascade
    rootNode.destroy();
    
    ok(orphanNode.destroyed === true, "The destroyed property of the orphan node should be true.");
    ok(Object.keys(orphanNode).length === 1, "All properties except 'destroyed' should be deleted on the orphan node.");
    
    ok(anotherChildNode.destroyed === true, "The destroyed property of the other child node should be true.");
    ok(Object.keys(anotherChildNode).length === 1, "All properties except 'destroyed' should be deleted on the other child node.");
    
    ok(rootNode.destroyed === true, "The destroyed property of the root node should be true.");
    ok(Object.keys(rootNode).length === 1, "All properties except 'destroyed' should be deleted on the root node.");
});

test("Create granchildren and do reparenting", function() {
    var r1 = new myt.Node();
    var c1r1 = new myt.Node(r1);
    var c2r1 = new myt.Node(r1);
    var c3r1 = new myt.Node(r1);
    var c1c3r1 = new myt.Node(c3r1);
    var c2c3r1 = new myt.Node(c3r1);
    var c3c3r1 = new myt.Node(c3r1);
    
    ok(c3c3r1.isDescendantOf(c3r1) === true, "Child descendant check");
    ok(c3c3r1.isDescendantOf(r1) === true, "Grandchild descendant check");
    ok(r1.isAncestorOf(c3c3r1) === true, "Grandchild ancestor check");
    
    var r2 = new myt.Node();
    var c1r2 = new myt.Node(r2);
    var c2r2 = new myt.Node(r2);
    
    var c3r2 = new myt.Node();
    var c1c3r2 = new myt.Node(c3r2);
    var c2c3r2 = new myt.Node(c3r2);
    var c3c3r2 = new myt.Node(c3r2);
    
    ok(c3c3r2.isDescendantOf(c3r2) === true, "Child descendant check");
    ok(c3r2.isAncestorOf(c3c3r2) === true, "Child ancestor check");
    
    c3r2.setParent(r2);
    
    ok(c3c3r2.isDescendantOf(c3r2) === true, "Child descendant check");
    ok(c3c3r2.isDescendantOf(r2) === true, "Grandchild after formerly orphaned parent descendant check");
    ok(r2.isAncestorOf(c3c3r2) === true, "Grandchild after formerly orphaned parent ancestor check");
    
    // Reparent one tree to another
    c3r1.setParent(c3c3r2);
    
    ok(c3c3r2.getSubnodes().includes(c3r1) === true, "Reparenting works for target");
    ok(r1.getSubnodes().includes(c3r1) === false, "Reparenting works for origin");
    ok(c3c3r1.isDescendantOf(r2) === true, "Descendant check after reparenting");
    
    r2.setParent(r1);
    
    ok(c3c3r1.isDescendantOf(r1) === true, "Descendant again after merging everything into one tree under r1.");
    
    r1.destroy();
    
    ok(c3c3r1.isDescendantOf(r2) === false, "Not a descendant after destruction");
});

test("Don't allow reparenting to destroyed nodes", function() {
    var r = new myt.Node();
    r.destroy();
    
    ok(r.destroyed === true, "The destroyed property of the root node should be true.");
    ok(Object.keys(r).length === 1, "All properties except 'destroyed' should be deleted on the root node.");
    
    var c1 = new myt.Node(r);
    
    ok(r.subnodes === undefined, "Subnodes should be undefined since root was destroyed.");
    ok(c1.parent === undefined, "Parent should not be set since it was destroyed.");
    
    var c2 = new myt.Node();
    c2.setParent(r);
    
    ok(r.subnodes === undefined, "Subnodes should be undefined since root was destroyed.");
    ok(c2.parent === undefined, "Parent should not be set since it was destroyed.");
    
    c1.destroy();
    c2.destroy();
});

test("Ancestor matching", function() {
    var ClassA = new JS.Class('ClassA', myt.Node);
    var ClassB = new JS.Class('ClassB', myt.Node);
    var ClassC = new JS.Class('ClassC', ClassB);
    
    var instA = new ClassA();
    ok(instA != null, "instA exists");
    ok(instA instanceof ClassA, "Is an instance of ClassA");
    ok(!(instA instanceof ClassB), "Is not an instance of ClassB");
    
    var instB = new ClassB();
    ok(instB != null, "instB exists");
    ok(instB instanceof ClassB, "Is an instance of ClassB");
    ok(!(instB instanceof ClassC), "Is not an instance of ClassC");
    
    var instC = new ClassC();
    ok(instC != null, "instC exists");
    ok(instC instanceof ClassC, "Is an instance of ClassC");
    ok(instC instanceof ClassB, "Is an instance of ClassB through subclassing");
    
    new myt.Node(instA, {name:'foo'});
    new myt.Node(instB, {name:'foo'});
    new myt.Node(instC, {name:'foo'});
    new ClassB(instC, {name:'bar'});
    new myt.Node(instC.bar, {name:'baz'});
    
    // searchAncestorsForClass tests
    var found = instA.foo.searchAncestorsForClass(ClassA);
    ok(found === instA, "Should find the ancestor of ClassA.");
    
    var found2 = instB.foo.searchAncestorsForClass(ClassB);
    ok(found2 === instB, "Should find the ancestor of ClassB.");
    
    var found3 = instC.foo.searchAncestorsForClass(ClassC);
    ok(found3 === instC, "Should find the ancestor of ClassC.");
    
    var found4 = instC.foo.searchAncestorsForClass(ClassB);
    ok(found4 === instC, "Should find the ancestor of ClassB.");
    
    var found5 = instC.bar.baz.searchAncestorsForClass(ClassB);
    ok(found5 === instC.bar, "Should find the first ancestor of ClassB.");
    
    var found6 = instC.bar.baz.searchAncestorsForClass(ClassC);
    ok(found6 === instC, "Should find the first ancestor of ClassC.");
    
    var found7 = instC.bar.baz.searchAncestorsForClass(ClassA);
    ok(found7 === undefined, "Should find the no ancestor of ClassA.");
    
    var failToFind = instC.bar.baz.searchAncestorsForClass(null);
    ok(failToFind === undefined, "Should not find the ancestor since no class was provided.");
    
    // getMatchingAncestorOrSelf and searchAncestorsOrSelf
    var func = function(n) {return n.name === 'foo';};
    
    ok(myt.Node.getMatchingAncestorOrSelf(instA.foo, null) === undefined, "Bad args should return undefined.");
    ok(myt.Node.getMatchingAncestorOrSelf(null, func) === undefined, "Bad args should return undefined.");
    
    var match = myt.Node.getMatchingAncestorOrSelf(instA.foo, func);
    ok(match === instA.foo, "Name should match foo");
    var matchAlt = instA.foo.searchAncestorsOrSelf(func);
    ok(matchAlt === instA.foo, "Name should match foo");
    
    var failMatch = myt.Node.getMatchingAncestorOrSelf(instA.foo, function(n) {
        return n.name === 'bar';
    });
    ok(failMatch === undefined, "No match should be found since no ancestor is named 'bar'");
    
    // getMatchingAncestor and searchAncestors
    var func2 = function(n) {return n.isRoot();};
    
    ok(myt.Node.getMatchingAncestor(instC.bar.baz, null) === undefined, "Bad args should return undefined.");
    ok(myt.Node.getMatchingAncestor(null, func2) === undefined, "Bad args should return undefined.");
    
    var match2 = myt.Node.getMatchingAncestor(instC.bar.baz, func2);
    ok(match2 === instC, "Root should be root");
    var match2Alt = instC.bar.baz.searchAncestors(func2);
    ok(match2Alt === instC, "Root should be root");
    
    var failMatch2 = myt.Node.getMatchingAncestor(instC.bar.baz, function(n) {
        return n.getSubnodes().length === 99;
    });
    ok(failMatch2 === undefined, "No match should be found since no subnodes count is 99");
    
    instA.destroy();
    instB.destroy();
    instC.destroy();
});

test("Node: getLeastCommonAncestor", function() {
    var root = new myt.Node();
    
    var n1 = new myt.Node(root);
    var n2 = new myt.Node(root);
    var n3 = new myt.Node(root);
    
    var n11 = new myt.Node(n1);
    var n12 = new myt.Node(n1);
    var n13 = new myt.Node(n1);
    
    var n31 = new myt.Node(n3);
    var n32 = new myt.Node(n3);
    var n33 = new myt.Node(n3);
    
    ok(root.getLeastCommonAncestor() === undefined, "Common ancestor of undefined is undefined.");
    ok(root.getLeastCommonAncestor(null) === undefined, "Common ancestor of null is undefined.");
    ok(root.getLeastCommonAncestor(true) === undefined, "Common ancestor of true is undefined.");
    
    ok(root.getLeastCommonAncestor(root) === root, "Common ancestor of node and itself is the node itself.");
    ok(n1.getLeastCommonAncestor(root) === root, "Common ancestor of ancestor and the node is the ancestor.");
    ok(n11.getLeastCommonAncestor(root) === root, "Common ancestor of ancestor and the node is the ancestor.");
    ok(root.getLeastCommonAncestor(n1) === root, "Common ancestor of node and descendant is the node.");
    ok(root.getLeastCommonAncestor(n11) === root, "Common ancestor of node and descendant is the node.");
    
    ok(n12.getLeastCommonAncestor(n11) === n1, "Common ancestor of two siblings is the parent node.");
    ok(n13.getLeastCommonAncestor(n33) === root, "Common ancestor of two cousins is the grandparent node.");
    ok(n13.getLeastCommonAncestor(n2) === root, "Common ancestor of node and uncle is the grandparent node.");
    
    root.destroy();
});
