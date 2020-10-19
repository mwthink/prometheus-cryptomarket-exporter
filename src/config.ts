const currencyString = process.env['CURRENCIES'] || '';

const inputCurrencies = currencyString.split(' ').filter(s => Boolean(s.trim()))

const defaultCurrencies = [
  'bitcoin', // BTC
  'monero', // XMR
  'ethereum', // ETH
];

const currencyList = inputCurrencies.length > 0 ? inputCurrencies : defaultCurrencies

export default {
  interval_seconds: Number(process.env['SCRAPE_INTERVAL'] || 10),
  listen_port: Number(process.env['LISTEN_PORT'] || 3000),
  metric_prefix: 'coingecko',
  vs_currency: (process.env['VS_CURRENCY'] || 'usd').toLowerCase(),
  currencies: currencyList
}
