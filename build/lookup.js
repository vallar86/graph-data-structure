"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lookup = void 0;
function chunk(array, chunkSize) {
    const length = Math.ceil(array.length / chunkSize);
    const result = new Array(length);
    for (let i = 0; i < length; i++) {
        result[i] = array.slice(i * chunkSize, (i + 1) * chunkSize);
        // do whatever
    }
    return result;
}
function createUint8Array(graph, nodes, chunk) {
    const result = new Uint8Array(nodes.map((node, index) => {
        const bstr = chunk.map(n => graph.hasEdge(n, node) ? 1 : 0).join("");
        return parseInt(bstr, 2);
    }));
    return result;
}
function createMatrix(graph, nodes, chunks) {
    const matrix = nodes.map(node1 => new Uint8Array(nodes.map(node2 => graph.hasEdge(node1, node2) ? 1 : 0))); //chunks.map((chunk) => createUint8Array(graph, nodes, chunk));
    const rotated = new Array(nodes.length);
    for (let j = 0; j < nodes.length; j++)
        rotated[j] = new Uint8Array(nodes.length);
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < nodes.length; j++) {
            rotated[j][i] = matrix[i][j];
        }
    }
    return {
        normal: matrix,
        rotated: rotated
    };
}
function applyVectorToMatrix(vector, matrix, nodes, level) {
    const result = new Uint8Array(vector.length * nodes.length);
    let skip = 0;
    for (let i = 0; i < vector.length; i++) {
        let isEmpty = true;
        for (let j = 0; j < nodes.length; j++) {
            const a = vector[i];
            const b = matrix[i % matrix.length][j];
            const v = a & b;
            if (v > 0) {
                isEmpty = false;
                const y = (i - skip) * nodes.length + j;
                result[y] = v;
            }
        }
        skip += (isEmpty) ? 1 : 0;
    }
    const compressed = result.slice(0, result.length - (skip * nodes.length));
    return compressed;
}
function createStartVector(startNodes, map) {
    const result = new Uint8Array(map.size);
    for (const node of startNodes) {
        result[map.get(node)] = 1;
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
        const bitVector = createStartVector(startNodes, map);
        //new Uint8Array(chunks.map((chunk) => parseInt(chunk.map((i) => startNodes.includes(i) ? 1 : 0).join(""), 2)));
        const bitMatrix = createMatrix(graph, nodes, chunks);
        const result1 = applyVectorToMatrix(bitVector, bitMatrix.normal, nodes, 1);
        const result2 = applyVectorToMatrix(result1, bitMatrix.rotated, nodes, 2);
        const result3 = applyVectorToMatrix(result2, bitMatrix.rotated, nodes, 3);
        console.log(result3);
    }
    return {
        Loops: Loops
    };
}
exports.Lookup = Lookup;
//# sourceMappingURL=lookup.js.map