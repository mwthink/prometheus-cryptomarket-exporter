import Axios from 'axios';

export const gecko = Axios.create({
  baseURL: 'https://api.coingecko.com/api/v3',
})

export type CoinGeckoSimplePriceResult = {
  [currency:string]: {
    [price_currency:string]: number;
  }
}

export type CoinGeckoCoinListing = {
  id: string;
  symbol: string;
  name: string;
}

export type CoinGeckoCoinInfo = CoinGeckoCoinListing & {
  block_time_in_minutes?: number;
  hashing_algorithm?: number;
  asset_platform_id?: string;
  categories?: string[];
  links?: {
    homepage?: string[];
  }
  image?: {
    thumb?: string;
    small?: string;
    large?: string;
  }
  genesis_date?: string;
  market_data?: {
    current_price?: {
      [currency:string]: number;
    }
  }
  last_updated?: string;
  tickers?: CoinGeckoTickerInfo[];
}

export type CoinGeckoTickerInfo = {
  base: string;
  target: string;
  market: any;
  last: number;
  volume: number;
  converted_last: any;
  converted_volume: any;
  coin_id: string;
  // TODO more values
}

export const getAllCoinGeckoCoins = async (): Promise<CoinGeckoCoinListing[]> => (
  gecko.get('/coins/list').then(r => r.data)
)

export const getCoinGeckoCoinInfo = async (coin_id:string): Promise<CoinGeckoCoinInfo> => (
  gecko.get(`/coins/${coin_id}`).then(r => r.data)
)

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
