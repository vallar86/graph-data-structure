import * as graph from './graph';

export class SzwarcfiterLauerSimpleCycles<TNode, TData>
{
    graph: graph.IGraph<TNode, TData>;

    constructor(graph : graph.IGraph<TNode, TData>)
    {
        this.graph = graph;
    }

    public findSimpleCycles() {
        
    }
}