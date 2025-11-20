/** A k-d Tree implementation.
    
    Ported from:
        k-d Tree JavaScript - V 1.01 on 04/10/17
        
        https://github.com/ubilabs/kd-tree-javascript
        
        @author Mircea Pricop <pricop@ubilabs.net>, 2012
        @author Martin Kleppe <kleppe@ubilabs.net>, 2012
        @author Ubilabs http://ubilabs.net, 2012
        MIT License <http://www.opensource.org/licenses/mit-license.php>
*/
myt.KDTreeNode = new JS.Class('KDTreeNode', {
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function(obj, dimension, parent) {
        this.obj = obj;
        this.left = null;
        this.right = null;
        this.parent = parent;
        this.dimension = dimension;
    }
});

/** Binary heap implementation from:
    http://eloquentjavascript.net/appendix2.html */
myt.BinaryHeap = new JS.Class('BinaryHeap', {
    // Constructor /////////////////////////////////////////////////////////////
    initialize: function(scoreFunction) {
        this.content = [];
        this.scoreFunction = scoreFunction;
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    push: function(element) {
        // Add the new element to the end of the array.
        this.content.push(element);
        
        // Allow it to bubble up.
        this.bubbleUp(this.content.length - 1);
    },
    
    pop: function() {
        // Store the first element so we can return it later.
        const content = this.content,
            result = content[0],
            // Get the element at the end of the array.
            end = content.pop();
        
        // If there are any elements left, put the end element at the
        // start, and let it sink down.
        if (content.length > 0) {
            content[0] = end;
            this.sinkDown(0);
        }
        return result;
    },
    
    peek: function() {
        return this.content[0];
    },
    
    remove: function(node) {
        const content = this.content,
            len = content.length;
        let i = 0, 
            end;
        // To remove a value, we must search through the array to find it.
        for (; i < len;) {
            if (content[i++] == node) {
                // When it is found, the process seen in 'pop' is repeated
                // to fill up the hole.
                end = content.pop();
                if (i != len - 1) {
                    content[i] = end;
                    if (this.scoreFunction(end) < this.scoreFunction(node)) {
                        this.bubbleUp(i);
                    } else {
                        this.sinkDown(i);
                    }
                }
                return;
            }
        }
        throw new Error("Node not found.");
    },
    
    size: function() {
        return this.content.length;
    },
    
    bubbleUp: function(n) {
        // Fetch the element that has to be moved.
        const content = this.content,
            element = content[n];
        let parentN,
            parent;
        
        // When at 0, an element can not go up any further.
        while (n > 0) {
            // Compute the parent element's index, and fetch it.
            parentN = Math.floor((n + 1) / 2) - 1;
            parent = content[parentN];
            
            // Swap the elements if the parent is greater.
            if (this.scoreFunction(element) < this.scoreFunction(parent)) {
                content[parentN] = element;
                content[n] = parent;
                // Update 'n' to continue at the new position.
                n = parentN;
            } else {
                // Found a parent that is less, no need to move it further.
                break;
            }
        }
    },
    
    sinkDown: function(n) {
        // Look up the target element and its score.
        const content = this.content,
            length = content.length,
            element = content[n],
            elemScore = this.scoreFunction(element);
        
        while (true) {
            // Compute the indices of the child elements.
            let child2N = (n + 1) * 2, 
                child1N = child2N - 1;
            // This is used to store the new position of the element, if any.
            let swap = null,
                child1Score;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                const child1 = content[child1N];
                child1Score = this.scoreFunction(child1);
                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore) swap = child1N;
            }
            // Do the same checks for the other child.
            if (child2N < length) {
                const child2 = content[child2N],
                    child2Score = this.scoreFunction(child2);
                if (child2Score < (swap == null ? elemScore : child1Score)) swap = child2N;
            }
            
            // If the element needs to be moved, swap it, and continue.
            if (swap != null) {
                content[n] = content[swap];
                content[swap] = element;
                n = swap;
            } else {
                // Otherwise, we are done.
                break;
            }
        }
    }
});

myt.KDTree = new JS.Class('KDTree', {
    // Class Methods and Attributes ////////////////////////////////////////////
    extend: {
        EUCLIDEAN_METRIC: function(a, b) {
            return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
        }
    },
    
    
    // Constructor /////////////////////////////////////////////////////////////
    /** Create a new Path. */
    initialize: function(points, metric, dimensions) {
        this.metric = metric;
        this.dimensions = dimensions;
        
        // If points is not an array, assume we're loading a pre-built tree
        this.rebuildTree(points);
    },
    
    
    // Methods /////////////////////////////////////////////////////////////////
    rebuildTree: function(points) {
        this.root = this.buildTree(points, 0, null);
    },
    
    buildTree: function(points, depth, parent) {
        const dimensions = this.dimensions,
            dim = depth % dimensions.length;
        let median, 
            node;
        
        if (points.length === 0) return null;
        if (points.length === 1) return new myt.KDTreeNode(points[0], dim, parent);
        
        points.sort(function (a, b) {
            return a[dimensions[dim]] - b[dimensions[dim]];
        });
        
        median = Math.floor(points.length / 2);
        node = new myt.KDTreeNode(points[median], dim, parent);
        node.left = this.buildTree(points.slice(0, median), depth + 1, node);
        node.right = this.buildTree(points.slice(median + 1), depth + 1, node);
        
        return node;
    },
    
    insert: function(point) {
        const dimensions = this.dimensions;
        let newNode,
            dimension;
        
        function innerSearch(node, parent) {
            if (node === null) return parent;
            
            const dimension = dimensions[node.dimension];
            if (point[dimension] < node.obj[dimension]) {
                return innerSearch(node.left, node);
            } else {
                return innerSearch(node.right, node);
            }
        }
        
        const insertPosition = innerSearch(this.root, null);
        
        if (insertPosition === null) {
            this.root = new myt.KDTreeNode(point, 0, null);
            return;
        }
        
        newNode = new myt.KDTreeNode(point, (insertPosition.dimension + 1) % dimensions.length, insertPosition);
        dimension = dimensions[insertPosition.dimension];
        
        if (point[dimension] < insertPosition.obj[dimension]) {
            insertPosition.left = newNode;
        } else {
            insertPosition.right = newNode;
        }
    },
    
    /*
    As of 1.0.1 remove still doesn't work in all cases.
    remove: function(point) {
        let node, dimensions = this.dimensions, self = this;
        
        function nodeSearch(node) {
            if (node === null) return null;
            
            if (node.obj === point) return node;
            
            const dimension = dimensions[node.dimension];
            
            if (point[dimension] < node.obj[dimension]) {
                return nodeSearch(node.left);
            } else {
                return nodeSearch(node.right);
            }
        }
        
        function removeNode(node) {
            let nextNode, nextObj, pDimension;
            
            function findMin(node, dim) {
                let dimension, own, left, right, min;
                
                if (node === null) return null;
                
                dimension = dimensions[dim];
                
                if (node.dimension === dim) {
                    if (node.left !== null) return findMin(node.left, dim);
                    return node;
                }
                
                own = node.obj[dimension];
                left = findMin(node.left, dim);
                right = findMin(node.right, dim);
                min = node;
                
                if (left !== null && left.obj[dimension] < own) min = left;
                if (right !== null && right.obj[dimension] < min.obj[dimension]) min = right;
                return min;
            }
            
            if (node.left === null && node.right === null) {
                if (node.parent === null) {
                    self.root = null;
                    return;
                }
                
                pDimension = dimensions[node.parent.dimension];
                
                if (node.obj[pDimension] < node.parent.obj[pDimension]) {
                    node.parent.left = null;
                } else {
                    node.parent.right = null;
                }
                return;
            }
            
            // If the right subtree is not empty, swap with the minimum element on the
            // node's dimension. If it is empty, we swap the left and right subtrees and
            // do the same.
            if (node.right !== null) {
                nextNode = findMin(node.right, node.dimension);
                nextObj = nextNode.obj;
                removeNode(nextNode);
                node.obj = nextObj;
            } else {
                nextNode = findMin(node.left, node.dimension);
                nextObj = nextNode.obj;
                removeNode(nextNode);
                node.right = node.left;
                node.left = null;
                node.obj = nextObj;
            }
        }
        
        node = nodeSearch(this.root);
        if (node !== null) removeNode(node);
    },*/
    
    nearest: function(point, maxNodes, maxDistance) {
        const self = this,
            dimensions = self.dimensions;
        let i, 
            result, 
            bestNodes;
        
        bestNodes = new myt.BinaryHeap(
            function(e) {return -e[1];}
        );
        
        function nearestSearch(node) {
            let bestChild,
                dimension = dimensions[node.dimension],
                ownDistance = self.metric(point, node.obj),
                linearPoint = {},
                linearDistance,
                otherChild,
                i;
            
            function saveNode(node, distance) {
                bestNodes.push([node, distance]);
                if (bestNodes.size() > maxNodes) bestNodes.pop();
            }
            
            for (i = 0; i < dimensions.length; i += 1) {
                if (i === node.dimension) {
                    linearPoint[dimensions[i]] = point[dimensions[i]];
                } else {
                    linearPoint[dimensions[i]] = node.obj[dimensions[i]];
                }
            }
            
            linearDistance = self.metric(linearPoint, node.obj);
            
            if (node.right === null && node.left === null) {
                if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
                    saveNode(node, ownDistance);
                }
                return;
            }
            
            if (node.right === null) {
                bestChild = node.left;
            } else if (node.left === null) {
                bestChild = node.right;
            } else {
                if (point[dimension] < node.obj[dimension]) {
                    bestChild = node.left;
                } else {
                    bestChild = node.right;
                }
            }
            
            nearestSearch(bestChild);
            
            if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
                saveNode(node, ownDistance);
            }
            
            if (bestNodes.size() < maxNodes || Math.abs(linearDistance) < bestNodes.peek()[1]) {
                if (bestChild === node.left) {
                    otherChild = node.right;
                } else {
                    otherChild = node.left;
                }
                if (otherChild !== null) nearestSearch(otherChild);
            }
        }
        
        if (maxDistance) {
            for (i = 0; i < maxNodes; i += 1) {
                bestNodes.push([null, maxDistance]);
            }
        }
        
        if (self.root) nearestSearch(self.root);
        
        result = [];
        
        for (i = 0; i < Math.min(maxNodes, bestNodes.content.length); i += 1) {
            if (bestNodes.content[i][0]) {
                result.push([bestNodes.content[i][0].obj, bestNodes.content[i][1]]);
            }
        }
        return result;
    },
    
    balanceFactor: function() {
        const self = this;
        
        function height(node) {
            if (node === null) return 0;
            return Math.max(height(node.left), height(node.right)) + 1;
        }
        
        function count(node) {
            if (node === null) return 0;
            return count(node.left) + count(node.right) + 1;
        }
        
        return height(self.root) / (Math.log(count(self.root)) / Math.log(2));
    }
});
