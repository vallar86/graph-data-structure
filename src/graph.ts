/*

1) Прописать типы и интерфейс возврата
2) Сделать тип узла дженериком
3) Сделать тип узла дженериком?
4) Добавить лукап

*/

type EdgeWeight = number;
type EncodedEdge = string;

// type NodeId = string;

interface Serialized<NodeId>
{
    nodes: { id: NodeId }[];
    links: { source: NodeId; target: NodeId; weight: EdgeWeight }[];
}

class CycleError extends Error
{
    constructor(message: string)
    {
        super(message);
        Object.setPrototypeOf(this, CycleError.prototype);
    }
}

export interface IGraph<NodeId>
{
    addNode(node: NodeId): IGraph<NodeId>,
    removeNode(node: NodeId): IGraph<NodeId>,
    nodes(): NodeId[],
    adjacent(node: NodeId): NodeId[],
    addEdge(u: NodeId, v: NodeId, weight?: EdgeWeight): IGraph<NodeId>,
    removeEdge(u: NodeId, v: NodeId): IGraph<NodeId>,
    hasEdge(u: NodeId, v: NodeId): boolean,
    setEdgeWeight(u: NodeId, v: NodeId, weight: EdgeWeight): IGraph<NodeId>,
    getEdgeWeight(u: NodeId, v: NodeId): EdgeWeight,
    indegree(node: NodeId): number,
    outdegree(node: NodeId): number,
    depthFirstSearch(
        sourceNodes: NodeId[],
        includeSourceNodes: boolean,
        errorOnCycle: boolean,
    ): NodeId[],
    hasCycle(): boolean,
    lowestCommonAncestors(node1: NodeId, node2: NodeId): NodeId[],
    topologicalSort(sourceNodes: NodeId[], includeSourceNodes: boolean): NodeId[],
    shortestPath(source: NodeId, destination: NodeId): NodeId[] & { weight?: EdgeWeight },
    serialize(): Serialized<NodeId>,
    deserialize(serialized: Serialized<NodeId>): IGraph<NodeId>
}

// A graph data structure with depth-first search and topological sort.
export function Graph<NodeId extends string | number | symbol>(serialized?: Serialized<NodeId>) 
{
    // Returned graph instance
    const graph: IGraph<NodeId> = {
        addNode,
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
    const edges: Map<NodeId, Set<NodeId>> = new Map<NodeId, Set<NodeId>>();

    // The weights of edges.
    // Keys are string encodings of edges.
    // Values are weights (numbers).
    const edgeWeights: Record<EncodedEdge, EdgeWeight> = {};

    // If a serialized graph was passed into the constructor, deserialize it.
    if (serialized)
    {
        deserialize(serialized);
    }

    // Adds a node to the graph.
    // If node was already added, this function does nothing.
    // If node was not already added, this function sets up an empty adjacency list.
    function addNode(node: NodeId): IGraph<NodeId>
    {
        edges.set(node, adjacentAsSet(node));
        return graph;
    }

    // Removes a node from the graph.
    // Also removes incoming and outgoing edges.
    function removeNode(node: NodeId): IGraph<NodeId>
    {
        // Remove incoming edges.
        edges.forEach(function (set, u)
        {
            set.forEach(function (x, v)
            {
                if (v === node)
                {
                    removeEdge(u, v);
                }
            });
        });

        // Remove outgoing edges (and signal that the node no longer exists).
        edges.delete(node);

        return graph;
    }

    // Gets the list of nodes that have been added to the graph.
    function nodes(): NodeId[]
    {
        // TODO: Better implementation with set data structure
        // const nodeSet: Record<NodeId, boolean> = {};

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
    function adjacent(node: NodeId): NodeId[]
    {
        return Array.from(adjacentAsSet(node));
    }

    // Gets the adjacent node list for the given node.
    // Returns an empty array for unknown nodes.
    function adjacentAsSet(node: NodeId): Set<NodeId>
    {
        return edges.get(node) || new Set<NodeId>();
    }

    // Sets the weight of the given edge.
    function setEdgeWeight(u: NodeId, v: NodeId, weight: EdgeWeight): IGraph<NodeId>
    {
        edgeWeights[`${u.toString()}|${v.toString()}`] = weight;
        return graph;
    }

    // Gets the weight of the given edge.
    // Returns 1 if no weight was previously set.
    function getEdgeWeight(u: NodeId, v: NodeId): EdgeWeight
    {
        const weight = edgeWeights[`${u.toString()}|${v.toString()}`];
        return weight === undefined ? 1 : weight;
    }

    // Adds an edge from node u to node v.
    // Implicitly adds the nodes if they were not already added.
    function addEdge(u: NodeId, v: NodeId, weight?: EdgeWeight): IGraph<NodeId>
    {
        addNode(u);
        addNode(v);
        
        (edges.get(u) as Set<NodeId>).add(v);

        if (weight !== undefined)
        {
            setEdgeWeight(u, v, weight);
        }

        return graph;
    }

    // Removes the edge from node u to node v.
    // Does not remove the nodes.
    // Does nothing if the edge does not exist.
    function removeEdge(u: NodeId, v: NodeId): IGraph<NodeId>
    {
        if (edges.has(u) && edges.get(u)?.has(v))
        {
            edges.get(u)?.delete(v);
        }
        return graph;
    }

    // Returns true if there is an edge from node u to node v.
    function hasEdge(u: NodeId, v: NodeId): boolean
    {
        return edges.has(u) && (edges.get(u) as Set<NodeId>)?.has(v);
    }

    // Computes the indegree for the given node.
    // Not very efficient, costs O(E) where E = number of edges.
    function indegree(node: NodeId): number
    {
        let degree = 0;

        edges.forEach(function (set, u)
        {
            if (set.has(node))
                degree++;
        });
        return degree;
    }

    // Computes the outdegree for the given node.
    function outdegree(node: NodeId): number 
    {
        return edges.has(node) ? (edges.get(node) as Set<NodeId>).size : 0;
    }

    // Depth First Search algorithm, inspired by
    // Cormen et al. "Introduction to Algorithms" 3rd Ed. p. 604
    // The additional option `includeSourceNodes` specifies whether to
    // include or exclude the source nodes from the result (true by default).
    // If `sourceNodes` is not specified, all nodes in the graph
    // are used as source nodes.
    function depthFirstSearch(
        sourceNodes?: NodeId[],
        includeSourceNodes: boolean = true,
        errorOnCycle: boolean = false,
    ): NodeId[]
    {
        if (!sourceNodes)
        {
            sourceNodes = nodes();
        }

        if (typeof includeSourceNodes !== "boolean")
        {
            includeSourceNodes = true;
        }

        const visited: Set<NodeId> = new Set<NodeId>();
        const visiting: Set<NodeId> = new Set<NodeId>();
        const nodeList: NodeId[] = [];

        function DFSVisit(node: NodeId): void
        {
            if (visiting.has(node) && errorOnCycle)
            {
                throw new CycleError("Cycle found");
            }
            if (!visited.has(node))
            {
                visited.add(node);
                visiting.add(node);  // temporary flag while visiting
                adjacentAsSet(node).forEach(DFSVisit);
                visiting.delete(node);
                nodeList.push(node);
            }
        }

        if (includeSourceNodes)
        {
            sourceNodes.forEach(DFSVisit);
        } else
        {
            sourceNodes.forEach(function (node)
            {
                visited.add(node);
            });
            sourceNodes.forEach(function (node)
            {
                adjacentAsSet(node).forEach(DFSVisit);
            });
        }

        return nodeList;
    }

    // Returns true if the graph has one or more cycles and false otherwise
    function hasCycle(): boolean
    {
        try
        {
            depthFirstSearch(undefined, true, true);
            // No error thrown -> no cycles
            return false;
        }
        catch (error)
        {
            if (error instanceof CycleError)
            {
                return true;
            }
            else
            {
                throw error;
            }
        }
    }

    // Least Common Ancestors
    // Inspired by https://github.com/relaxedws/lca/blob/master/src/LowestCommonAncestor.php code
    // but uses depth search instead of breadth. Also uses some optimizations
    function lowestCommonAncestors(node1: NodeId, node2: NodeId): NodeId[]
    {
        const node1Ancestors: NodeId[] = [];
        const lcas: NodeId[] = [];

        function CA1Visit(
            visited: Set<NodeId>,
            node: NodeId
        ): boolean
        {
            if (!visited.has(node))
            {
                visited.add(node);
                node1Ancestors.push(node);
                if (node == node2)
                {
                    lcas.push(node);
                    return false; // found - shortcut
                }

                return Array.from(adjacentAsSet(node).values()).every(node => CA1Visit(visited, node));

            } else
            {
                return true;
            }
        }

        function CA2Visit(visited: Set<NodeId>, node: NodeId)
        {
            if (!visited.has(node))
            {
                visited.add(node);
                if (node1Ancestors.indexOf(node) >= 0)
                {
                    lcas.push(node);
                } else if (lcas.length == 0)
                {
                    adjacentAsSet(node).forEach(node =>
                    {
                        CA2Visit(visited, node);
                    });
                }
            }
        }

        if (CA1Visit(new Set<NodeId>(), node1))
        {
            // No shortcut worked
            CA2Visit(new Set<NodeId>(), node2);
        }

        return lcas;
    }

    // The topological sort algorithm yields a list of visited nodes
    // such that for each visited edge (u, v), u comes before v in the list.
    // Amazingly, this comes from just reversing the result from depth first search.
    // Cormen et al. "Introduction to Algorithms" 3rd Ed. p. 613
    function topologicalSort(
        sourceNodes?: NodeId[],
        includeSourceNodes: boolean = true
    ): NodeId[]
    {
        return depthFirstSearch(sourceNodes, includeSourceNodes, true).reverse();
    }

    // Dijkstra's Shortest Path Algorithm.
    // Cormen et al. "Introduction to Algorithms" 3rd Ed. p. 658
    // Variable and function names correspond to names in the book.
    function shortestPath(source: NodeId, destination: NodeId) {
        // Upper bounds for shortest path weights from source.
        const d: Record<NodeId, EdgeWeight> = {} as Record<NodeId, EdgeWeight>;

        // Predecessors.
        const p: Record<NodeId, NodeId> = {} as Record<NodeId, NodeId>;

        // Poor man's priority queue, keyed on d.
        let q: Record<NodeId, boolean> = {} as Record<NodeId, boolean>;

        function initializeSingleSource() {
            nodes().forEach(function(node) {
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
            nodes().forEach(function(node) {
                q[node] = true;
            });
        }

        // Returns true if q is empty.
        function priorityQueueEmpty() {
            return Object.keys(q).length === 0;
        }

        // Linear search to extract (find and remove) min from q.
        function extractMin(): NodeId | null {
            let min = Infinity;
            let minNode;

            let xxx = Object.keys(q);


            Object.keys(q).forEach(function(node) {
                if (d[node as NodeId] < min) {
                    min = d[node as NodeId];
                    minNode = node;
                }
            });
            if (minNode === undefined) {
                // If we reach here, there's a disconnected subgraph, and we're done.
                q = {} as Record<NodeId, boolean>;
                return null;
            }
            delete q[minNode];
            return minNode;
        }

        function relax(u: NodeId, v: NodeId) {
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
                if (u === null) return;
                adjacentAsSet(u).forEach(function(v) {
                    relax(u, v);
                });
            }
        }

        // Assembles the shortest path by traversing the
        // predecessor subgraph from destination to source.
        function path() {
            const nodeList: NodeId[] & { weight?: EdgeWeight } = [];
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
    function serialize(): Serialized<NodeId>
    {
        const serialized: Serialized<NodeId> = {
            nodes: nodes().map(function (id)
            {
                return { id: id };
            }),
            links: []
        };

        serialized.nodes.forEach(function (node)
        {
            const source = node.id;
            adjacentAsSet(source).forEach(function (target)
            {
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
    function deserialize(serialized: Serialized<NodeId>): IGraph<NodeId>
    {
        serialized.nodes.forEach(function (node)
        {
            addNode(node.id);
        });
        serialized.links.forEach(function (link)
        {
            addEdge(link.source, link.target, link.weight);
        });
        return graph;
    }

    // The returned graph instance.
    return graph;
}
