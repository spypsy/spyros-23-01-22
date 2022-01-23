import { Ticker } from './types'

export const FEED_URL = 'wss://www.cryptofacilities.com/ws/v1'

export const TICKER_INCREMENTS: { [t: string]: number } = {
  [Ticker.BTC]: 0.5,
  [Ticker.ETH]: 0.05,
}
