
import { Graph, IGraph } from './graph';
import { Lookup } from './lookup';

var graph = Graph();
graph.addEdge("a", "b", 1); graph.addEdge("b", "a", 0.5);
graph.addEdge("b", "c", 1); graph.addEdge("c", "b", 0.5);
graph.addEdge("c", "d", 1); graph.addEdge("d", "c", 0.5);


const lookup = Lookup(graph, 3);

lookup.Loops(3, ["b"]);

export * from './graph'
export * from './lookup'