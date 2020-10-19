import * as Prom from 'prom-client';
import * as Http from 'http';
import config from './config';
import { getCoinGeckoPrice } from './utils';

const priceGauges = config.currencies.reduce((acc, c) => ({
  ...acc,
  [c]: new Prom.Gauge({
    name: [c.split('-').join('_'),'price',config.vs_currency.toLowerCase()].join('_'),
    help: `Price of 1 ${c} in ${config.vs_currency.toUpperCase()}`
  })
}
), {})

const updateStats = async (): Promise<void> => {
  await getCoinGeckoPrice(config.currencies, [config.vs_currency])
  .then(prices => {
    Object.keys(prices).forEach(currency_code => {
      priceGauges[currency_code].set(prices[currency_code][config.vs_currency])
    })
  })
}

const server = Http.createServer((req, res) => {
  res.write(Prom.register.metrics());
  res.end();
})

Promise.resolve().then(async () => {
  console.log('Initializing stats');
  await updateStats()
})
.then(() => {
  console.log('Starting server')
  server.listen(config.listen_port, () => {
    console.log('Listening on', config.listen_port)
    setInterval(async () => {
      await updateStats();
    }, config.interval_seconds * 1000)
  });

  // Handle process termination
  const TERM_SIGS = ['SIGINT','SIGTERM'];
  TERM_SIGS.forEach(sig => {
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
