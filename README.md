# prometheus-cryptomarket-exporter
This will scrape CoinGecko for cryptocurrency prices and then provide them
as Prometheus-style metrics.

One instance can scrape multiple currency prices, but will only get values
in a single currency (configurable with `VS_CURRENCY`). Prices will be
scraped every _n_ seconds where _n_ is an integer specified
by `SCRAPE_INTERVAL` (10 seconds by default).

The instance will listen for requests on an HTTP server and serve up the metrics.

## Docker Images
This project is intended to be run as a Docker image. Images are pushed to the
repo `docker.io/mwthink/prometheus-cryptomarket-exporter`.

There are two tags that should be used:
- `latest` - Built by the automated system on pushes to the _main_ branch
- `multiarch` - Built by hand, for multiple architecture types

Both images should be considered _stable_, the multiarch image might be
older. 

## Building
You can build locally with:
```sh
yarn install
yarn run build
```

You can build a docker image with:
```sh
docker build .
```
