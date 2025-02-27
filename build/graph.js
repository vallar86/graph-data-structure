"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Graph = void 0;
class CycleError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, CycleError.prototype);
    }
}
// A graph data structure with depth-first search and topological sort.
function Graph(serialized) {
    // Returned graph instance
    const graph = {
        addNode,
        setData,
        removeNode,
        nodes,
        adjacent,
        addEdge,
        removeEdge,
        hasEdge,
        setEdgeWeight,
        getEdgeWeight,
        indegree,
        outdegree,
        depthFirstSearch,
        lookup,
        hasCycle,
        lowestCommonAncestors,
        topologicalSort,
        shortestPath,
        serialize,
        deserialize
    };
    // The adjacency list of the graph.
    // Keys are node ids.
    // Values are adjacent node id arrays.
    const edges = new Map();
    const datas = new Map();
    const TNodeIdPrototypes = new Set([typeof String(), typeof Symbol(), typeof Number()]);
    // The weights of edges.
    // Keys are string encodings of edges.
    // Values are weights (numbers).
    const edgeWeights = {};
    // If a serialized graph was passed into the constructor, deserialize it.
    if (serialized) {
        deserialize(serialized);
    }
    function toNode(node) {
        if (TNodeIdPrototypes.has(typeof node)) {
            return { id: node };
        }
        else {
            return node;
        }
    }
    function toNodeId(node) {
        if (TNodeIdPrototypes.has(typeof node)) {
            return node;
        }
        else {
            return node.id;
        }
    }
    // Adds a node to the graph.
    // If node was already added, this function does nothing.
    // If node was not already added, this function sets up an empty adjacency list.
    function addNode(node) {
        const _node = toNode(node);
        edges.set(_node.id, adjacentAsSet(_node.id));
        setData(_node.id, _node.data);
        return graph;
    }
    function setData(id, data) {
        datas.set(id, data);
        return graph;
    }
    // Removes a node from the graph.
    // Also removes incoming and outgoing edges.
    function removeNode(node) {
        // Remove incoming edges.
        edges.forEach(function (set, u) {
            set.forEach(function (x, v) {
                if (v === node) {
                    removeEdge(u, v);
                }
            });
        });
        // Remove outgoing edges (and signal that the node no longer exists).
        edges.delete(node);
        if (datas.has(node))
            datas.delete(node);
        return graph;
    }
    // Gets the list of nodes that have been added to the graph.
    function nodes() {
        // TODO: Better implementation with set data structure
        // const nodeSet: Record<TNodeId, boolean> = {};
        // Object.keys(edges).forEach(function (u)
        // {
        //     nodeSet[u] = true;
        //     edges[u].forEach(function (v)
        //     {
        //         nodeSet[v] = true;
        //     });
        // });
        // return Object.keys(nodeSet);
        return Array.from(edges.keys());
    }
    // Gets the adjacent node list for the given node.
    // Returns an empty array for unknown nodes.
    function adjacent(node) {
        return Array.from(adjacentAsSet(node));
    }
    // Gets the adjacent node list for the given node.
    // Returns an empty array for unknown nodes.
    function adjacentAsSet(node) {
        return edges.get(node) || new Set();
    }
    // Sets the weight of the given edge.
    function setEdgeWeight(u, v, weight) {
        edgeWeights[`${u.toString()}|${v.toString()}`] = weight;
        return graph;
    }
    // Gets the weight of the given edge.
    // Returns 1 if no weight was previously set.
    function getEdgeWeight(u, v) {
        const weight = edgeWeights[`${u.toString()}|${v.toString()}`];
        return weight === undefined ? 1 : weight;
    }
    // Adds an edge from node u to node v.
    // Implicitly adds the nodes if they were not already added.
    function addEdge(u, v, weight) {
        addNode(u);
        addNode(v);
        const _u = toNodeId(u);
        const _v = toNodeId(v);
        edges.get(_u).add(_v);
        if (weight !== undefined) {
            setEdgeWeight(_u, _v, weight);
        }
        return graph;
    }
    // Removes the edge from node u to node v.
    // Does not remove the nodes.
    // Does nothing if the edge does not exist.
    function removeEdge(u, v) {
        var _a, _b;
        if (edges.has(u) && ((_a = edges.get(u)) === null || _a === void 0 ? void 0 : _a.has(v))) {
            (_b = edges.get(u)) === null || _b === void 0 ? void 0 : _b.delete(v);
        }
        return graph;
    }
    // Returns true if there is an edge from node u to node v.
    function hasEdge(u, v) {
        var _a;
        return edges.has(u) && ((_a = edges.get(u)) === null || _a === void 0 ? void 0 : _a.has(v));
    }
    // Computes the indegree for the given node.
    // Not very efficient, costs O(E) where E = number of edges.
    function indegree(node) {
        let degree = 0;
        edges.forEach(function (set, u) {
            if (set.has(node))
                degree++;
        });
        return degree;
    }
    // Computes the outdegree for the given node.
    function outdegree(node) {
        return edges.has(node) ? edges.get(node).size : 0;
    }
    // Depth First Search algorithm, inspired by
    // Cormen et al. "Introduction to Algorithms" 3rd Ed. p. 604
    // The additional option `includeSourceNodes` specifies whether to
    // include or exclude the source nodes from the result (true by default).
    // If `sourceNodes` is not specified, all nodes in the graph
    // are used as source nodes.
    function depthFirstSearch(sourceNodes, includeSourceNodes = true, errorOnCycle = false, maxLevel = Number.MAX_SAFE_INTEGER, callback) {
        if (!sourceNodes) {
            sourceNodes = nodes();
        }
        if (typeof includeSourceNodes !== "boolean") {
            includeSourceNodes = true;
        }
        const visited = new Set();
        const visiting = new Set();
        const nodeList = [];
        function DFSVisit(node, level = 1, path = []) {
            if (visiting.has(node) && errorOnCycle) {
                throw new CycleError("Cycle found");
            }
            if (!visited.has(node) && level <= maxLevel) {
                visited.add(node);
                visiting.add(node); // temporary flag while visiting
                path.push(node);
                adjacentAsSet(node).forEach((i) => DFSVisit(i, level + 1, path));
                visiting.delete(node);
                nodeList.push(node);
                if (callback !== undefined)
                    callback(nodeList, level, path);
                path.pop();
            }
        }
        if (includeSourceNodes) {
            sourceNodes.forEach(i => DFSVisit(i));
        }
        else {
            sourceNodes.forEach(function (node) {
                visited.add(node);
            });
            sourceNodes.forEach(function (node) {
                adjacentAsSet(node).forEach(i => DFSVisit(i));
            });
        }
        return nodeList;
    }
    // Returns true if the graph has one or more cycles and false otherwise
    function hasCycle() {
        try {
            depthFirstSearch(undefined, true, true);
            // No error thrown -> no cycles
            return false;
        }
        catch (error) {
            if (error instanceof CycleError) {
                return true;
            }
            else {
                throw error;
            }
        }
    }
    // Least Common Ancestors
    // Inspired by https://github.com/relaxedws/lca/blob/master/src/LowestCommonAncestor.php code
    // but uses depth search instead of breadth. Also uses some optimizations
    function lowestCommonAncestors(node1, node2) {
        const node1Ancestors = [];
        const lcas = [];
        function CA1Visit(visited, node) {
            if (!visited.has(node)) {
                visited.add(node);
                node1Ancestors.push(node);
                if (node == node2) {
                    lcas.push(node);
                    return false; // found - shortcut
                }
                return Array.from(adjacentAsSet(node).values()).every(node => CA1Visit(visited, node));
            }
            else {
                return true;
            }
        }
        function CA2Visit(visited, node) {
            if (!visited.has(node)) {
                visited.add(node);
                if (node1Ancestors.indexOf(node) >= 0) {
                    lcas.push(node);
                }
                else if (lcas.length == 0) {
                    adjacentAsSet(node).forEach(node => {
                        CA2Visit(visited, node);
                    });
                }
            }
        }
        if (CA1Visit(new Set(), node1)) {
            // No shortcut worked
            CA2Visit(new Set(), node2);
        }
        return lcas;
    }
    // The topological sort algorithm yields a list of visited nodes
    // such that for each visited edge (u, v), u comes before v in the list.
    // Amazingly, this comes from just reversing the result from depth first search.
    // Cormen et al. "Introduction to Algorithms" 3rd Ed. p. 613
    function topologicalSort(sourceNodes, includeSourceNodes = true) {
        return depthFirstSearch(sourceNodes, includeSourceNodes, true).reverse();
    }
    // Dijkstra's Shortest Path Algorithm.
    // Cormen et al. "Introduction to Algorithms" 3rd Ed. p. 658
    // Variable and function names correspond to names in the book.
    function shortestPath(source, destination) {
        // Upper bounds for shortest path weights from source.
        const d = {};
        // Predecessors.
        const p = {};
        // Poor man's priority queue, keyed on d.
        let q = {};
        function initializeSingleSource() {
            nodes().forEach(function (node) {
                d[node] = Infinity;
            });
            if (d[source] !== Infinity) {
                throw new Error("Source node is not in the graph");
            }
            if (d[destination] !== Infinity) {
                throw new Error("Destination node is not in the graph");
            }
            d[source] = 0;
        }
        // Adds entries in q for all nodes.
        function initializePriorityQueue() {
            nodes().forEach(function (node) {
                q[node] = true;
            });
        }
        // Returns true if q is empty.
        function priorityQueueEmpty() {
            return Object.keys(q).length === 0;
        }
        // Linear search to extract (find and remove) min from q.
        function extractMin() {
            let min = Infinity;
            let minNode;
            let xxx = Object.keys(q);
            Object.keys(q).forEach(function (node) {
                if (d[node] < min) {
                    min = d[node];
                    minNode = node;
                }
            });
            if (minNode === undefined) {
                // If we reach here, there's a disconnected subgraph, and we're done.
                q = {};
                return null;
            }
            delete q[minNode];
            return minNode;
        }
        function relax(u, v) {
            const w = getEdgeWeight(u, v);
            if (d[v] > d[u] + w) {
                d[v] = d[u] + w;
                p[v] = u;
            }
        }
        function dijkstra() {
            initializeSingleSource();
            initializePriorityQueue();
            while (!priorityQueueEmpty()) {
                const u = extractMin();
                if (u === null)
                    return;
                adjacentAsSet(u).forEach(function (v) {
                    relax(u, v);
                });
            }
        }
        // Assembles the shortest path by traversing the
        // predecessor subgraph from destination to source.
        function path() {
            const nodeList = [];
            let weight = 0;
            let node = destination;
            while (p[node]) {
                nodeList.push(node);
                weight += getEdgeWeight(p[node], node);
                node = p[node];
            }
            if (node !== source) {
                throw new Error("No path found");
            }
            nodeList.push(node);
            nodeList.reverse();
            nodeList.weight = weight;
            return nodeList;
        }
        dijkstra();
        return path();
    }
    // Serializes the graph.
    function serialize() {
        const serialized = {
            nodes: nodes().map(function (id) {
                return { id: id };
            }),
            links: []
        };
        serialized.nodes.forEach(function (node) {
            const source = node.id;
            adjacentAsSet(source).forEach(function (target) {
                serialized.links.push({
                    source: source,
                    target: target,
                    weight: getEdgeWeight(source, target)
                });
            });
        });
        return serialized;
    }
    // Deserializes the given serialized graph.
    function deserialize(serialized) {
        serialized.nodes.forEach(function (node) {
            addNode(node.id);
        });
        serialized.links.forEach(function (link) {
            addEdge(link.source, link.target, link.weight);
        });
        return graph;
    }
    function lookup(sourceNodes, maxLevel, callback) {
        const path = new Set();
        function process(node, level = 0) {
            if (!path.has(node)) {
                path.add(node);
                if (callback(path, level)) {
                    for (const next of adjacent(node)) {
                        process(next, level + 1);
                    }
                }
                path.delete(node);
            }
        }
        for (const node of sourceNodes) {
            process(node);
        }
    }
    // The returned graph instance.
    return graph;
}
exports.Graph = Graph;
//# sourceMappingURL=graph.js.map