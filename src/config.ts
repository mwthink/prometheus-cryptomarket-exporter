export default {
  interval_seconds: Number(process.env['SCRAPE_INTERVAL'] || 10),
  listen_port: Number(process.env['LISTEN_PORT'] || 3000),
  vs_currency: (process.env['VS_CURRENCY'] || 'usd').toLowerCase(),
  currencies: [
    'bitcoin', // BTC
    'monero', // XMR
    'tezos', // XTZ
    'ethereum', // ETH
    'dai', // DAI
    'uniswap', // UNI
    'wrapped-bitcoin', // WBTC
    'orchid-protocol', // OXT
    'harvest-finance', // FARM
  ],
}
