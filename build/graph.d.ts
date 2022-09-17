declare type EdgeWeight = number;
interface Serialized<NodeId> {
    nodes: {
        id: NodeId;
    }[];
    links: {
        source: NodeId;
        target: NodeId;
        weight: EdgeWeight;
    }[];
}
export interface IGraph<NodeId> {
    addNode(node: NodeId): IGraph<NodeId>;
    removeNode(node: NodeId): IGraph<NodeId>;
    nodes(): NodeId[];
    adjacent(node: NodeId): NodeId[];
    addEdge(u: NodeId, v: NodeId, weight?: EdgeWeight): IGraph<NodeId>;
    removeEdge(u: NodeId, v: NodeId): IGraph<NodeId>;
    hasEdge(u: NodeId, v: NodeId): boolean;
    setEdgeWeight(u: NodeId, v: NodeId, weight: EdgeWeight): IGraph<NodeId>;
    getEdgeWeight(u: NodeId, v: NodeId): EdgeWeight;
    indegree(node: NodeId): number;
    outdegree(node: NodeId): number;
    depthFirstSearch(sourceNodes: NodeId[], includeSourceNodes: boolean, errorOnCycle: boolean): NodeId[];
    hasCycle(): boolean;
    lowestCommonAncestors(node1: NodeId, node2: NodeId): NodeId[];
    topologicalSort(sourceNodes: NodeId[], includeSourceNodes: boolean): NodeId[];
    shortestPath(source: NodeId, destination: NodeId): NodeId[] & {
        weight?: EdgeWeight;
    };
    serialize(): Serialized<NodeId>;
    deserialize(serialized: Serialized<NodeId>): IGraph<NodeId>;
}
export declare function Graph<NodeId extends string | number | symbol>(serialized?: Serialized<NodeId>): IGraph<NodeId>;
export {};
