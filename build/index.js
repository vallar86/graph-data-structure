"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
const graph_1 = require("./graph");
const lookup_1 = require("./lookup");
var graph = graph_1.Graph();
graph.addEdge("a", "b", 1);
graph.addEdge("b", "a", 0.5);
graph.addEdge("b", "c", 1);
graph.addEdge("c", "b", 0.5);
graph.addEdge("c", "d", 1);
graph.addEdge("d", "c", 0.5);
const lookup = lookup_1.Lookup(graph, 3);
lookup.Loops(3, ["b"]);
__exportStar(require("./graph"), exports);
__exportStar(require("./lookup"), exports);
//# sourceMappingURL=index.js.map