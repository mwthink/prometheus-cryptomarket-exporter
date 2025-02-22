import * as Prom from 'prom-client';
import * as Express from 'express';
import config from './config';
import { CoinGeckoCoinListing, getAllCoinGeckoCoins, getCoinGeckoPrice } from './utils';

let appIsReady = false;

let allCoins: {[currency_code:string]: CoinGeckoCoinListing} = {};
const priceGauges = config.currencies.reduce((acc, c) => ({
  ...acc,
  [c]: new Prom.Gauge({
    name: [config.metric_prefix,'price',c.split('-').join('_'),config.vs_currency.toLowerCase()].join('_'),
    help: `Price of 1 ${c} in ${config.vs_currency.toUpperCase()}`,
    labelNames: ['currency_id','currency_name','currency_symbol','vs_currency']
  })
}
), {})

const updateStats = async (): Promise<void> => {
  await getCoinGeckoPrice(config.currencies, [config.vs_currency])
  .then(prices => {
    Object.keys(prices).forEach(currency_code => {
      priceGauges[currency_code].set(
        {
          currency_id: allCoins[currency_code].id,
          currency_name: allCoins[currency_code].name,
          currency_symbol: allCoins[currency_code].symbol,
          vs_currency: config.vs_currency.toUpperCase(),
        },
        prices[currency_code][config.vs_currency]
      )
    })
  })
}

const app = Express();

// GET list of supported coins
app.get('/coins', async (req, res) => {
  const coins = await getAllCoinGeckoCoins();
  return res.send(coins);
})

// GET prometheus metrics
app.get('/metrics', (req, res, next) => {
  return res.contentType('text/plain')
    .set('Cache-control', 'public, max-age=5')
    .send(Prom.register.metrics())
});

// Root redirect
app.get('/', ({}, res) => res.redirect('/metrics'));

// Liveness/Readiness
const healthHandler: Express.Handler = (req, res, next) => {
  if(!appIsReady){
    return res.status(500).contentType('text/plain').send('not ready')
  }
  return res.status(200).contentType('text/plain').send('ok')
};
app.get('/healthz',healthHandler);

// Main app logic
Promise.resolve()
.then(async () => {
  // Initialize coin info
  console.log('Initializing coin list');
  const initTime = Date.now();
  allCoins = (await getAllCoinGeckoCoins())
    .reduce((acc, coin) => ({
      ...acc,
      [coin.id]: coin
    }), {})
  console.log(`Finished loading coin list - Took ${Math.round((Date.now() - initTime) / 1000)} seconds`)
  // Initialize stats
  await updateStats();
})
.then(() => {
  // Start server
  const server = app.listen(config.listen_port, () => {
    console.log('Listening on port', config.listen_port);
    appIsReady = true;
    // Update the prices on a loop
    setInterval(async () => {
      await updateStats();
    }, config.interval_seconds * 1000)
  })

  // Handle process termination
  const TERM_SIGS = ['SIGINT','SIGTERM'];
  TERM_SIGS.forEach(sig => {
    appIsReady = false;
    process.on(sig, () => {
      console.log(`Received ${sig}`);
      server.close(() => {
        console.log('Server stopped');
        console.log('Clean up complete')
        process.exit()
      })
    })
  })
})
