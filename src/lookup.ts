import { BitSet, ReadOnlyBitSet } from 'bitset';
import * as GPU from 'gpu.js';
import { Graph, IGraph } from './index'

type int = number;

interface ILookup<NodeId>
{
    Loops(maxLevel: int, [...start]: NodeId[]): void
}

function chunk<TElement>(array: Array<TElement>, chunkSize: int): Array<TElement>[]
{
    const length = Math.ceil(array.length / chunkSize);
    const result = new Array<Array<TElement>>(length);

    for (let i = 0; i < length; i++)
    {
        result[i] = array.slice(i * chunkSize, (i + 1) * chunkSize);
        // do whatever
    }

    return result;
}


function createArray<NodeId>(graph: IGraph<NodeId>, nodes: NodeId[], chunk: NodeId[]): Array<Number>
{
    const result = nodes.map((node, index) =>
    {
        const bstr = chunk.map(n => graph.hasEdge(n, node) ? 1 : 0).join("");
        return parseInt(bstr, 2);
    });

    return result;
}

function createMatrix<NodeId>(graph: IGraph<NodeId>, nodes: NodeId[], chunks: NodeId[][]): Array<number>[]
{
    const matrix = nodes.map(node1 => nodes.map(node2 => graph.hasEdge(node1, node2) ? 1 : 0)); //chunks.map((chunk) => createArray<Number>(graph, nodes, chunk));
    const rotated = new Array<Array<number>>(nodes.length)

    for (let j = 0; j < nodes.length; j++)
        rotated[j] = new Array<number>(nodes.length)

    for (let i = 0; i < matrix.length; i++)
    {
        for (let j = 0; j < nodes.length; j++)
        {
            rotated[j][i] = matrix[i][j];
        }
    }

    return matrix;
}


const gpu = new GPU.GPU();

function applyVectorToMatrix<NodeId>(vector: number[][], matrix: number[][]): Array<Number>
{
    const kernel = gpu.createKernel(
        function (vector: number[][], matrix: number[][]) {

        }
    );

    kernel.setOutput([vector.length * vector[0].length, matrix[0].length]);
    const result = kernel(vector, matrix) as number[][];

    return new Array<Number>(0);

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

function reduceVector(vector: Array<Number>, size: int): Array<Number>
{
    const result = new Array<Number>(vector.length + Math.ceil(vector.length / size));
    let index = 0;
    let skip = 0;
    let skipWritten = false;

    for (let i = 0; i < vector.length; i += size)
    {
        const slice = vector.slice(i, i + size);
        
        if (slice.every(v => v == 0))
        {
            skip++;
            skipWritten = false;
        }
        else
        {
            if (skip > 0 && !skipWritten)
            {
                result[i - (skip * size) + (skip - 1)] = skip * -1;
                skipWritten = true;
            }

            for (let j = i; j < i + size; j++)
            {
                result[j - (skip * size) + skip] = vector[j];
            }

            index = i - (skip * size) + size;
        }

    }

    return result;
}

function createStartVector<NodeId>(graph : IGraph<NodeId>, startNodes: NodeId[], map: Map<NodeId, int>): number[][]
{
    const result = new Array<Array<number>>(map.size);

    for(let i = 0; i < result.length; i++)
    {
        result[i] = new Array<number>(map.size).fill(0);
    }


    for (const node of startNodes)
    {
        for(const neighbor of graph.adjacent(node))
        {
            if (graph.hasEdge(node, neighbor))
            {
                result[map.get(node) as int][map.get(neighbor) as int] = 1;
            }
        }
    }

    return result;
}

export function Lookup<NodeId>(graph: IGraph<NodeId>, chunkSize: number = 32): ILookup<NodeId>
{
    const nodes = graph.nodes();
    const map = new Map<NodeId, int>(nodes.map((element, index) => [element, index]));
    const matrix = nodes.map(() => new Float32Array(nodes.length));

    for (const [node, index] of map.entries())
    {
        for (const neighbor of graph.adjacent(node))
        {
            const neighborIndex = map.get(neighbor) as int;
            matrix[index][neighborIndex] = graph.getEdgeWeight(node, neighbor);
        }
    }

    function Loops(maxLevel: int, startNodes: NodeId[]): void
    {
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

