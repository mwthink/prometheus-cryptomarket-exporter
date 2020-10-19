# prometheus-cryptomarket-exporter
This will scrape CoinGecko for cryptocurrency prices and then provide them
as Prometheus-style metrics.

One instance can scrape multiple currency prices, but will only get values
in a single currency (configurable with `VS_CURRENCY`). Prices will be
scraped every _n_ seconds where _n_ is an integer specified
by `SCRAPE_INTERVAL` (10 seconds by default).

The instance will listen for requests on an HTTP server and serve up the metrics.

