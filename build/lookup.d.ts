import { IGraph } from './index';
declare type int = number;
interface ILookup<NodeId> {
    Loops(maxLevel: int, [...start]: NodeId[]): void;
}
export declare function Lookup<NodeId>(graph: IGraph<NodeId>, chunkSize?: number): ILookup<NodeId>;
export {};
