import Axios from 'axios';

const gecko = Axios.create({
  baseURL: 'https://api.coingecko.com/api/v3',
})

export type CoinGeckoSimplePriceResult = {
  [currency:string]: {
    [price_currency:string]: number;
  }
}

/**
 * Returns a simple price chart for given currencies in the given vs_currencies
 * @param currencies Currencies to get prices of
 * @param vs_currencies Currencies to get prices in
 */
export const getCoinGeckoPrice = async (currencies:string[],vs_currencies:string[]): Promise<CoinGeckoSimplePriceResult> => {
  return gecko.get(`/simple/price`, {
    params: {
      ids: currencies.join(','),
      vs_currencies: vs_currencies.join(','),
    }
  })
  .then(r => {
    return r.data;
  })
}

/**
 * Gets a current price from CoinGecko for a coin
 * @param currency_code The currency to get a price for
 * @param value_currency The currency the price is in - Defaults to usd
 */
export const getCurrentPrice = async (currency_code:string, value_currency:string='usd'): Promise<number> => {
  const currencies = [currency_code];
  const vs_currencies = [value_currency];
  return getCoinGeckoPrice(currencies, vs_currencies).then(res => {
    if(!res[currency_code] || !res[currency_code][value_currency]){
      throw new Error(`No price found for ${currency_code} --> ${value_currency}`)
    }
    return res[currency_code][value_currency];
  })
}
