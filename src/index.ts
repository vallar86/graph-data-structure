
export * from './graph'
import ccxt from 'ccxt.pro'
import { Graph } from './graph';

const exchange = new ccxt.binance();


const graph = Graph();

exchange.loadMarkets().then(markets => {

    for(const market of Object.values(markets))
    {
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