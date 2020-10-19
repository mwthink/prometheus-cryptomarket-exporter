import * as Prom from 'prom-client';
import * as Express from 'express';
import config from './config';
import { getCoinGeckoPrice } from './utils';

const priceGauges = config.currencies.reduce((acc, c) => ({
  ...acc,
  [c]: new Prom.Gauge({
    name: [config.metric_prefix,'price',c.split('-').join('_'),config.vs_currency.toLowerCase()].join('_'),
    help: `Price of 1 ${c} in ${config.vs_currency.toUpperCase()}`,
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

const app = Express();

app.get('/metrics', (req, res, next) => {
  return res.contentType('text/plain')
    .set('Cache-control', 'public, max-age=5')
    .send(Prom.register.metrics())
});

app.get('/', ({}, res) => res.redirect('/metrics'));

// Main app logic
Promise.resolve()
.then(async () => {
  // Initialize stats
  await updateStats();
})
.then(() => {
  // Start server
  const server = app.listen(config.listen_port, () => {
    console.log('Listening on port', config.listen_port);
    // Update the prices on a loop
    setInterval(async () => {
      await updateStats();
    }, config.interval_seconds * 1000)
  })

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
