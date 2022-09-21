type EdgeWeight = number;
type EncodedEdge = string;

// type TNodeId = string;

export interface INode<TNodeId, TNodeData>
{ 
    id : TNodeId, 
    data? : TNodeData 
}

interface Serialized<TNodeId, TNodeData>
{
    nodes: INode<TNodeId, TNodeData>[];
    links: { source: TNodeId; target: TNodeId; weight: EdgeWeight }[];
}

class CycleError extends Error
{
    constructor(message: string)
    {
        super(message);
        Object.setPrototypeOf(this, CycleError.prototype);
    }
}

export interface IGraph<TNodeId, TNodeData>
{
    addNode(node: TNodeId | INode<TNodeId, TNodeData>): IGraph<TNodeId, TNodeData>,
    setData(id : TNodeId, data? : TNodeData) : IGraph<TNodeId, TNodeData>,
    removeNode(node: TNodeId): IGraph<TNodeId, TNodeData>,
    nodes(): TNodeId[],
    adjacent(node: TNodeId): TNodeId[],
    addEdge(u: TNodeId, v: TNodeId, weight?: EdgeWeight): IGraph<TNodeId, TNodeData>,
    removeEdge(u: TNodeId, v: TNodeId): IGraph<TNodeId, TNodeData>,
    hasEdge(u: TNodeId, v: TNodeId): boolean,
    setEdgeWeight(u: TNodeId, v: TNodeId, weight: EdgeWeight): IGraph<TNodeId, TNodeData>,
    getEdgeWeight(u: TNodeId, v: TNodeId): EdgeWeight,
    indegree(node: TNodeId): number,
    outdegree(node: TNodeId): number,
    depthFirstSearch(
        sourceNodes: TNodeId[],
        includeSourceNodes: boolean,
        errorOnCycle: boolean,
        callback? : (nodes: TNodeId[], level : number, path : TNodeId[]) => void
    ): TNodeId[],
    hasCycle(): boolean,
    lowestCommonAncestors(node1: TNodeId, node2: TNodeId): TNodeId[],
    topologicalSort(sourceNodes: TNodeId[], includeSourceNodes: boolean): TNodeId[],
    shortestPath(source: TNodeId, destination: TNodeId): TNodeId[] & { weight?: EdgeWeight },
    serialize(): Serialized<TNodeId, TNodeData>,
    deserialize(serialized: Serialized<TNodeId, TNodeData>): IGraph<TNodeId, TNodeData>
}

// A graph data structure with depth-first search and topological sort.
export function Graph<TNodeId extends string | number | symbol, TNodeData extends any | undefined>(serialized?: Serialized<TNodeId, TNodeData>) 
{
    // Returned graph instance
    const graph: IGraph<TNodeId, TNodeData> = {
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
    const edges: Map<TNodeId, Set<TNodeId>> = new Map<TNodeId, Set<TNodeId>>();
    const datas: Map<TNodeId, TNodeData | undefined> = new Map<TNodeId, TNodeData | undefined>();
    const TNodeIdPrototypes = new Set<string>([typeof String(), typeof Symbol(), typeof Number()]);

    // The weights of edges.
    // Keys are string encodings of edges.
    // Values are weights (numbers).
    const edgeWeights: Record<EncodedEdge, EdgeWeight> = {};

    // If a serialized graph was passed into the constructor, deserialize it.
    if (serialized)
    {
        deserialize(serialized);
    }


    function toNode(node: TNodeId | INode<TNodeId, TNodeData>) : INode<TNodeId, TNodeData>
    {
        if (TNodeIdPrototypes.has(typeof node))
        {
            return { id: node } as INode<TNodeId, TNodeData>;
        }
        else
        {
            return node as INode<TNodeId, TNodeData>;
        }
    }

    function toNodeId(node: TNodeId | INode<TNodeId, TNodeData>) : TNodeId
    {
        if (TNodeIdPrototypes.has(typeof node))
        {
            return node as TNodeId;
        }
        else
        {
            return (node as INode<TNodeId, TNodeData>).id;
        }
    }

    // Adds a node to the graph.
    // If node was already added, this function does nothing.
    // If node was not already added, this function sets up an empty adjacency list.
    
    function addNode(node: TNodeId | INode<TNodeId, TNodeData>): IGraph<TNodeId, TNodeData>
    {
        const _node = toNode(node);
        edges.set(_node.id, adjacentAsSet(_node.id));
        setData(_node.id, _node.data);
        return graph;
    }

    function setData(id : TNodeId, data? : TNodeData): IGraph<TNodeId, TNodeData>
    {
        datas.set(id, data);
        return graph;
    }

    // Removes a node from the graph.
    // Also removes incoming and outgoing edges.
    function removeNode(node: TNodeId): IGraph<TNodeId, TNodeData>
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

        if (datas.has(node)) datas.delete(node);
        return graph;
    }

    // Gets the list of nodes that have been added to the graph.
    function nodes(): TNodeId[]
    {
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
    function adjacent(node: TNodeId): TNodeId[]
    {
        return Array.from(adjacentAsSet(node));
    }

    // Gets the adjacent node list for the given node.
    // Returns an empty array for unknown nodes.
    function adjacentAsSet(node: TNodeId): Set<TNodeId>
    {
        return edges.get(node) || new Set<TNodeId>();
    }

    // Sets the weight of the given edge.
    function setEdgeWeight(u: TNodeId, v: TNodeId, weight: EdgeWeight): IGraph<TNodeId, TNodeData>
    {
        edgeWeights[`${u.toString()}|${v.toString()}`] = weight;
        return graph;
    }

    // Gets the weight of the given edge.
    // Returns 1 if no weight was previously set.
    function getEdgeWeight(u: TNodeId, v: TNodeId): EdgeWeight
    {
        const weight = edgeWeights[`${u.toString()}|${v.toString()}`];
        return weight === undefined ? 1 : weight;
    }

    // Adds an edge from node u to node v.
    // Implicitly adds the nodes if they were not already added.
    function addEdge(
        u: TNodeId | INode<TNodeId, TNodeData>, 
        v: TNodeId | INode<TNodeId, TNodeData>, 
        weight?: EdgeWeight): IGraph<TNodeId, TNodeData>
    {
        addNode(u);
        addNode(v);

        const _u = toNodeId(u);
        const _v = toNodeId(v);

        (edges.get(_u) as Set<TNodeId>).add(_v);

        if (weight !== undefined)
        {
            setEdgeWeight(_u, _v, weight);
        }

        return graph;
    }

    // Removes the edge from node u to node v.
    // Does not remove the nodes.
    // Does nothing if the edge does not exist.
    function removeEdge(u: TNodeId, v: TNodeId): IGraph<TNodeId, TNodeData>
    {
        if (edges.has(u) && edges.get(u)?.has(v))
        {
            edges.get(u)?.delete(v);
        }
        return graph;
    }

    // Returns true if there is an edge from node u to node v.
    function hasEdge(u: TNodeId, v: TNodeId): boolean
    {
        return edges.has(u) && (edges.get(u) as Set<TNodeId>)?.has(v);
    }

    // Computes the indegree for the given node.
    // Not very efficient, costs O(E) where E = number of edges.
    function indegree(node: TNodeId): number
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
    function outdegree(node: TNodeId): number 
    {
        return edges.has(node) ? (edges.get(node) as Set<TNodeId>).size : 0;
    }

    // Depth First Search algorithm, inspired by
    // Cormen et al. "Introduction to Algorithms" 3rd Ed. p. 604
    // The additional option `includeSourceNodes` specifies whether to
    // include or exclude the source nodes from the result (true by default).
    // If `sourceNodes` is not specified, all nodes in the graph
    // are used as source nodes.
    function depthFirstSearch(
        sourceNodes?: TNodeId[],
        includeSourceNodes: boolean = true,
        errorOnCycle: boolean = false,
        callback? : (nodes: TNodeId[], level : number, path : TNodeId[]) => void
    ): TNodeId[]
    {
        if (!sourceNodes)
        {
            sourceNodes = nodes();
        }

        if (typeof includeSourceNodes !== "boolean")
        {
            includeSourceNodes = true;
        }

        const visited: Set<TNodeId> = new Set<TNodeId>();
        const visiting: Set<TNodeId> = new Set<TNodeId>();
        const nodeList: TNodeId[] = [];
        const maxLevel: number = 5;

        function DFSVisit(node: TNodeId, level : number = 1, path : TNodeId[] = []): void
        {
            if (visiting.has(node) && errorOnCycle)
            {
                throw new CycleError("Cycle found");
            }
            if (!visited.has(node) && level <= maxLevel)
            {
                visited.add(node);
                visiting.add(node);  // temporary flag while visiting
                
                path.push(node);
                adjacentAsSet(node).forEach((i) => DFSVisit(i, level + 1, path));
                

                visiting.delete(node);
                nodeList.push(node);

                if (callback !== undefined)
                    callback(nodeList, level, path);

                path.pop();
            }
        }

        if (includeSourceNodes)
        {
            sourceNodes.forEach(i => DFSVisit(i));
        } else
        {
            sourceNodes.forEach(function (node)
            {
                visited.add(node);
            });
            sourceNodes.forEach(function (node)
            {
                adjacentAsSet(node).forEach(i => DFSVisit(i));
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
    function lowestCommonAncestors(node1: TNodeId, node2: TNodeId): TNodeId[]
    {
        const node1Ancestors: TNodeId[] = [];
        const lcas: TNodeId[] = [];

        function CA1Visit(
            visited: Set<TNodeId>,
            node: TNodeId
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

        function CA2Visit(visited: Set<TNodeId>, node: TNodeId)
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

        if (CA1Visit(new Set<TNodeId>(), node1))
        {
            // No shortcut worked
            CA2Visit(new Set<TNodeId>(), node2);
        }

        return lcas;
    }

    // The topological sort algorithm yields a list of visited nodes
    // such that for each visited edge (u, v), u comes before v in the list.
    // Amazingly, this comes from just reversing the result from depth first search.
    // Cormen et al. "Introduction to Algorithms" 3rd Ed. p. 613
    function topologicalSort(
        sourceNodes?: TNodeId[],
        includeSourceNodes: boolean = true
    ): TNodeId[]
    {
        return depthFirstSearch(sourceNodes, includeSourceNodes, true).reverse();
    }

    // Dijkstra's Shortest Path Algorithm.
    // Cormen et al. "Introduction to Algorithms" 3rd Ed. p. 658
    // Variable and function names correspond to names in the book.
    function shortestPath(source: TNodeId, destination: TNodeId) {
        // Upper bounds for shortest path weights from source.
        const d: Record<TNodeId, EdgeWeight> = {} as Record<TNodeId, EdgeWeight>;

        // Predecessors.
        const p: Record<TNodeId, TNodeId> = {} as Record<TNodeId, TNodeId>;

        // Poor man's priority queue, keyed on d.
        let q: Record<TNodeId, boolean> = {} as Record<TNodeId, boolean>;

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
        function extractMin(): TNodeId | null {
            let min = Infinity;
            let minNode;

            let xxx = Object.keys(q);


            Object.keys(q).forEach(function(node) {
                if (d[node as TNodeId] < min) {
                    min = d[node as TNodeId];
                    minNode = node;
                }
            });
            if (minNode === undefined) {
                // If we reach here, there's a disconnected subgraph, and we're done.
                q = {} as Record<TNodeId, boolean>;
                return null;
            }
            delete q[minNode];
            return minNode;
        }

        function relax(u: TNodeId, v: TNodeId) {
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
            const nodeList: TNodeId[] & { weight?: EdgeWeight } = [];
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
    function serialize(): Serialized<TNodeId, TNodeData>
    {
        const serialized: Serialized<TNodeId, TNodeData> = {
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
    function deserialize(serialized: Serialized<TNodeId, TNodeData>): IGraph<TNodeId, TNodeData>
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
