
// Unit tests for reactive-property.
var assert = require("assert");

// If using from the NPM package, this line would be
// var Graph = require("graph-data-structure");
var { Graph, IGraph } = require("../build/index");
var { Lookup } = require("../build/lookup");



describe('lookup', () => {

	it('create lookup', () => {

		var graph = Graph();
		graph.addEdge("a", "b", 1); graph.addEdge("b", "a", 0.5);
		graph.addEdge("b", "c", 1); graph.addEdge("c", "b", 0.5); 
		graph.addEdge("c", "d", 1); graph.addEdge("d", "c", 0.5);


		const lookup = Lookup(graph, 3);
		
		lookup.Loops(3, "a");

	})

});

