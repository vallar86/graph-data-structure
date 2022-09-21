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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./graph"), exports);
const ccxt_pro_1 = __importDefault(require("ccxt.pro"));
const graph_1 = require("./graph");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const exchange = new ccxt_pro_1.default.binance();
        const graph = graph_1.Graph();
        yield exchange.loadMarkets().then(markets => {
            for (const market of Object.values(markets)) {
                graph.addEdge(market.base, market.quote);
                graph.addEdge(market.quote, market.base);
            }
        });
        graph.lookup(['RUB'], 5, (path, level) => {
            console.log(Array.from(path));
            return level < 4;
        });
        console.log('done');
    });
}
main();
// graph.addEdge(1, 2)
// graph.addEdge(1, 3)
// graph.addEdge(2, 3)
// graph.addEdge(2, 4)
// graph.addEdge(3, 4)
// graph.addEdge(4, 1)
//# sourceMappingURL=index.js.map