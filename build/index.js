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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./graph"), exports);
const ccxt_pro_1 = __importDefault(require("ccxt.pro"));
const graph_1 = require("./graph");
const exchange = new ccxt_pro_1.default.binance();
const graph = graph_1.Graph();
exchange.loadMarkets().then(markets => {
    for (const market of Object.values(markets)) {
        graph.addEdge(market.base, market.quote);
        graph.addEdge(market.quote, market.base);
    }
    let count = 0;
    const result = graph.depthFirstSearch(['USDT'], true, false, (list, level, path) => {
        count++;
        console.log(level, path);
    });
    console.log(result, count);
});
// graph.addEdge(1, 2)
// graph.addEdge(1, 3)
// graph.addEdge(2, 3)
// graph.addEdge(2, 4)
// graph.addEdge(3, 4)
// graph.addEdge(4, 1)
//# sourceMappingURL=index.js.map