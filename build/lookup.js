"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lookup = void 0;
const GPU = __importStar(require("gpu.js"));
function chunk(array, chunkSize) {
    const length = Math.ceil(array.length / chunkSize);
    const result = new Array(length);
    for (let i = 0; i < length; i++) {
        result[i] = array.slice(i * chunkSize, (i + 1) * chunkSize);
        // do whatever
    }
    return result;
}
function createArray(graph, nodes, chunk) {
    const result = nodes.map((node, index) => {
        const bstr = chunk.map(n => graph.hasEdge(n, node) ? 1 : 0).join("");
        return parseInt(bstr, 2);
    });
    return result;
}
function createMatrix(graph, nodes, chunks) {
    const matrix = nodes.map(node1 => nodes.map(node2 => graph.hasEdge(node1, node2) ? 1 : 0)); //chunks.map((chunk) => createArray<Number>(graph, nodes, chunk));
    const rotated = new Array(nodes.length);
    for (let j = 0; j < nodes.length; j++)
        rotated[j] = new Array(nodes.length);
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < nodes.length; j++) {
            rotated[j][i] = matrix[i][j];
        }
    }
    return matrix;
}
const gpu = new GPU.GPU();
function applyVectorToMatrix(vector, matrix) {
    const kernel = gpu.createKernel(function (vector, matrix) {
    });
    kernel.setOutput([vector.length * vector[0].length, matrix[0].length]);
    const result = kernel(vector, matrix);
    return new Array(0);
    // const result = new Array<Number>(vector.length * matrix[0].length);
    // for (let i = 0; i < vector.length; i++)
    // {
    //     for (let j = 0; j < matrix[0].length; j++)
    //     {
    //         const a = vector[i];
    //         const b = matrix[i % matrix.length][j];
    //         const v = a & b;
    //         result[i * matrix[0].length + j] = v;
    //     }
    // }
    // return reduceVector(result, matrix[0].length);
}
function reduceVector(vector, size) {
    const result = new Array(vector.length + Math.ceil(vector.length / size));
    let index = 0;
    let skip = 0;
    let skipWritten = false;
    for (let i = 0; i < vector.length; i += size) {
        const slice = vector.slice(i, i + size);
        if (slice.every(v => v == 0)) {
            skip++;
            skipWritten = false;
        }
        else {
            if (skip > 0 && !skipWritten) {
                result[i - (skip * size) + (skip - 1)] = skip * -1;
                skipWritten = true;
            }
            for (let j = i; j < i + size; j++) {
                result[j - (skip * size) + skip] = vector[j];
            }
            index = i - (skip * size) + size;
        }
    }
    return result;
}
function createStartVector(graph, startNodes, map) {
    const result = new Array(map.size);
    for (let i = 0; i < result.length; i++) {
        result[i] = new Array(map.size).fill(0);
    }
    for (const node of startNodes) {
        for (const neighbor of graph.adjacent(node)) {
            if (graph.hasEdge(node, neighbor)) {
                result[map.get(node)][map.get(neighbor)] = 1;
            }
        }
    }
    return result;
}
function Lookup(graph, chunkSize = 32) {
    const nodes = graph.nodes();
    const map = new Map(nodes.map((element, index) => [element, index]));
    const matrix = nodes.map(() => new Float32Array(nodes.length));
    for (const [node, index] of map.entries()) {
        for (const neighbor of graph.adjacent(node)) {
            const neighborIndex = map.get(neighbor);
            matrix[index][neighborIndex] = graph.getEdgeWeight(node, neighbor);
        }
    }
    function Loops(maxLevel, startNodes) {
        const chunks = chunk(nodes, chunkSize);
        const bitVector = createStartVector(graph, startNodes, map);
        //new Array<Number>(chunks.map((chunk) => parseInt(chunk.map((i) => startNodes.includes(i) ? 1 : 0).join(""), 2)));
        const bitMatrix = createMatrix(graph, nodes, chunks);
        const result1 = applyVectorToMatrix(bitVector, bitMatrix);
        // const result2 = applyVectorToMatrix(result1, bitMatrix);
        // const result3 = applyVectorToMatrix(result2, bitMatrix);
        console.log(result1);
    }
    return {
        Loops: Loops
    };
}
exports.Lookup = Lookup;
//# sourceMappingURL=lookup.js.map