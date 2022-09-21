
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
            graph.addEdge(market.base, market.quote, 1.01);
            graph.addEdge(market.quote, market.base, 0.99);
        }
    });


    graph.lookup(['RUB'], (path) => {
        if (path.size < 4)
        {
            console.log(Array.from(path));
            return true;
        }
        else
        {
            return false;
        }
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