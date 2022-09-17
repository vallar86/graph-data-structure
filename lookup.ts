import { Graph, IGraph } from './index'

interface ILookup<NodeId>
{

}

export function Lookup<NodeId>(graph : IGraph<NodeId>) : ILookup<NodeId>
{
    const lookup : ILookup<NodeId> = {

    };

    return lookup;
}

