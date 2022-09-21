
export * from './graph'
import ccxt from 'ccxt.pro'
import { Graph } from './graph';


async function main()
{

    const exchange = new ccxt.binance();
    const graph = Graph();

    await exchange.loadMarkets().then(markets =>
    {
        for (const market of Object.values(markets))
        {
            graph.addEdge(market.base, market.quote);
            graph.addEdge(market.quote, market.base);
        }
    });

    graph.lookup(['RUB'], 5, (path, level) => {
        console.log(Array.from(path));
        return level < 4;
    })

    console.log('done');
}

main();




// graph.addEdge(1, 2)
// graph.addEdge(1, 3)

// graph.addEdge(2, 3)

// graph.addEdge(2, 4)
// graph.addEdge(3, 4)

// graph.addEdge(4, 1)