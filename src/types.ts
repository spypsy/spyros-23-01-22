export interface MarketLevel {
  price: number
  size: number
  total: number
  // type: 'bid' | 'ask'
}

export enum Ticker {
  BTC = 'BTC',
  ETH = 'ETH',
}

export enum TickerProductId {
  BTC = 'PI_XBTUSD',
  ETH = 'PI_ETHUSD',
}

export enum BookSide {
  bid = 'bid',
  ask = 'ask',
}

export enum APIEvent {
  snapshot = 'book_ui_1_snapshot',
  update = 'book_ui_1',
}

export type APIOrders = [number, number][]

export interface APIOrderBook {
  bids: APIOrders
  asks: APIOrders
  ticker?: Ticker
}
