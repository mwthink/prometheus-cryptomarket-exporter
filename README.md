# prometheus-cryptomarket-exporter
This will scrape CoinGecko for cryptocurrency prices and then provide them
as Prometheus-style metrics.

The instance will listen for requests on an HTTP server and serve up the metrics.

## Deployment
This is intended to be deployed to a Kubernetes cluster with the Prometheus Operator:
```sh
kubectl apply -k ./deploy/
```

You can also run it via Docker:
```
docker run -p 3000:3000 mwthink/prometheus-cryptomarket-exporter:latest
```

## Configuration
Config options are specified via environment variables.
- `CURRENCIES`
  - Space-separated list of currencies to scrape (Default: `bitcoin monero ethereum`)
- `VS_CURRENCY`
  - The currency that prices should be tracked in (Default: `usd`)
- `SCRAPE_INTERVAL`
  - How often (in seconds) to scrape prices (Default: `10`)
- `METRICS_PREFIX`
  - String appended to front of prometheus metrics (Default: `cryptomarket`)
- `LISTEN_PORT`
  - Port for HTTP server to listen on (Default: `3000`)

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
