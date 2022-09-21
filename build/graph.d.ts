declare type EdgeWeight = number;
export interface INode<TNodeId, TNodeData> {
    id: TNodeId;
    data?: TNodeData;
}
interface Serialized<TNodeId, TNodeData> {
    nodes: INode<TNodeId, TNodeData>[];
    links: {
        source: TNodeId;
        target: TNodeId;
        weight: EdgeWeight;
    }[];
}
export interface IGraph<TNodeId, TNodeData> {
    addNode(node: TNodeId | INode<TNodeId, TNodeData>): IGraph<TNodeId, TNodeData>;
    setData(id: TNodeId, data?: TNodeData): IGraph<TNodeId, TNodeData>;
    removeNode(node: TNodeId): IGraph<TNodeId, TNodeData>;
    nodes(): TNodeId[];
    adjacent(node: TNodeId): TNodeId[];
    addEdge(u: TNodeId, v: TNodeId, weight?: EdgeWeight): IGraph<TNodeId, TNodeData>;
    removeEdge(u: TNodeId, v: TNodeId): IGraph<TNodeId, TNodeData>;
    hasEdge(u: TNodeId, v: TNodeId): boolean;
    setEdgeWeight(u: TNodeId, v: TNodeId, weight: EdgeWeight): IGraph<TNodeId, TNodeData>;
    getEdgeWeight(u: TNodeId, v: TNodeId): EdgeWeight;
    indegree(node: TNodeId): number;
    outdegree(node: TNodeId): number;
    depthFirstSearch(sourceNodes: TNodeId[], includeSourceNodes: boolean, errorOnCycle: boolean, callback?: (nodes: TNodeId[], level: number, path: TNodeId[]) => void): TNodeId[];
    hasCycle(): boolean;
    lowestCommonAncestors(node1: TNodeId, node2: TNodeId): TNodeId[];
    topologicalSort(sourceNodes: TNodeId[], includeSourceNodes: boolean): TNodeId[];
    shortestPath(source: TNodeId, destination: TNodeId): TNodeId[] & {
        weight?: EdgeWeight;
    };
    serialize(): Serialized<TNodeId, TNodeData>;
    deserialize(serialized: Serialized<TNodeId, TNodeData>): IGraph<TNodeId, TNodeData>;
}
export declare function Graph<TNodeId extends string | number | symbol, TNodeData extends any | undefined>(serialized?: Serialized<TNodeId, TNodeData>): IGraph<TNodeId, TNodeData>;
export {};
