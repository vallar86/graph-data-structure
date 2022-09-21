import * as graph from './graph';
export declare class SzwarcfiterLauerSimpleCycles<TNode, TData> {
    graph: graph.IGraph<TNode, TData>;
    constructor(graph: graph.IGraph<TNode, TData>);
    findSimpleCycles(): void;
}
