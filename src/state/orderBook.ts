import { createSlice } from '@reduxjs/toolkit'
import { TICKER_INCREMENTS } from '../constants'

import {
  APIOrderBook,
  APIOrders,
  BookSide,
  MarketLevel,
  Ticker,
} from '../types'

// could be variable?
const ORDER_BOOK_SIZE = 50

export interface OrderBookState {
  bids: MarketLevel[]
  asks: MarketLevel[]
  ticker: Ticker
  spread: number
  total: number
}

const initialState: OrderBookState = {
  bids: [],
  asks: [],
  ticker: Ticker.BTC,
  spread: 0,
  total: 0,
}

const sumOrders = (orders: APIOrders, side: BookSide): MarketLevel[] => {
  let total = 0
  // better to ensure orders are sorted
  return orders
    .sort(([a], [b]) => (side === BookSide.bid ? b - a : a - b))
    .map(([price, size]) => {
      total += size
      return {
        size,
        price,
        total,
      }
    })
}

// helper to round number up to 2 decimal digits
const roundNumber = (num: number) =>
  Math.round((num + Number.EPSILON) * 100) / 100

const getUpdatedLevel = (
  level: number,
  orders: APIOrders,
  existingOrders: MarketLevel[],
  total: number,
): MarketLevel | undefined => {
  // check first element of both arrays if it matches current price
  let newOrder
  let existingOrder

  // if (orders.length) console.log('comparing', level, roundNumber(orders[0][0]))

  if (orders.length && level === roundNumber(orders[0][0])) {
    newOrder = orders.shift()
  }

  if (existingOrders.length && level === roundNumber(existingOrders[0].price)) {
    existingOrder = existingOrders.shift()
  }

  if (newOrder) {
    // new data received on this level, add to state
    const [price, size] = newOrder

    // skip if size is 0
    if (size === 0) {
      return
    }
    total += size
    return { price, size, total }
  } else if (existingOrder) {
    // no new information, use existing order + update total
    total += existingOrder.size
    return {
      price: existingOrder.price,
      size: existingOrder.size,
      total,
    }
  }
}

const updateOrders = (
  _existingOrders: MarketLevel[],
  orders: APIOrders,
  side: BookSide,
  ticker: Ticker,
): MarketLevel[] => {
  let total = 0
  let existingOrders = [..._existingOrders]

  // if ask-side: sort ascending, bid-side: sort descending
  const incomingOrders = orders.sort(([a], [b]) =>
    side === BookSide.bid ? b - a : a - b,
  )

  let updatedOrders: MarketLevel[] = []

  let loopStart: number
  let loopEnd: number

  // have to loop through prices, from smallest to highest (ask) or vice versa (bid)
  if (side === BookSide.bid) {
    // in bid side, we start from larger prices and move downwards
    loopStart = Math.max(existingOrders[0].price, incomingOrders[0][0])
    loopEnd = Math.min(
      existingOrders[existingOrders.length - 1].price,
      incomingOrders[incomingOrders.length - 1][0],
    )

    for (
      let level = loopStart;
      level >= loopEnd;
      level -= TICKER_INCREMENTS[ticker]
    ) {
      // make sure we round level to avoid arithmetical errors
      level = roundNumber(level)

      const updatedLevel = getUpdatedLevel(level, orders, existingOrders, total)
      if (updatedLevel) {
        updatedOrders.push(updatedLevel)
        total = updatedLevel.total
      }
    }
  } else {
    // in ask side, we start from smaller price and moe upwards
    loopStart = Math.min(existingOrders[0].price, incomingOrders[0][0])
    loopEnd = Math.max(
      existingOrders[existingOrders.length - 1].price,
      incomingOrders[incomingOrders.length - 1][0],
    )

    for (
      let level = loopStart;
      level <= loopEnd;
      level += TICKER_INCREMENTS[ticker]
    ) {
      // make sure we round level to avoid arithmetical errors
      level = roundNumber(level)

      const updatedLevel = getUpdatedLevel(level, orders, existingOrders, total)
      if (updatedLevel) {
        updatedOrders.push(updatedLevel)
        total = updatedLevel.total
      }
    }
  }

  return updatedOrders
}

const updateState = (
  state: OrderBookState,
  bids: MarketLevel[],
  asks: MarketLevel[],
) => {
  state.bids = bids.slice(0, ORDER_BOOK_SIZE)
  state.asks = asks.slice(0, ORDER_BOOK_SIZE)

  // spread is the difference between lowest ask & highest bid
  state.spread = roundNumber(asks[0].price - bids[0].price)

  // find largest size from both sides to display depth percentage
  state.total = Math.max(
    bids[bids.length - 1].total,
    asks[asks.length - 1].total,
  )
}

export const orderBookSlice = createSlice({
  name: 'orderBook',
  initialState,
  reducers: {
    initialiseBook: (state, action: { payload: APIOrderBook }) => {
      const {
        payload: { bids, asks, ticker },
      } = action

      const initialBids = sumOrders(bids, BookSide.bid)
      const initialAsks = sumOrders(asks, BookSide.ask)

      updateState(state, initialBids, initialAsks)
      if (ticker) {
        state.ticker = ticker
      }
    },
    updateBook: (state, action: { payload: APIOrderBook }) => {
      const {
        payload: { bids, asks },
      } = action

      const newBids: MarketLevel[] = bids.length
        ? updateOrders(state.bids, bids, BookSide.bid, state.ticker)
        : state.bids
      const newAsks: MarketLevel[] = asks.length
        ? updateOrders(state.asks, asks, BookSide.ask, state.ticker)
        : state.asks

      updateState(state, newBids, newAsks)
    },
    resetBook: state => {
      state.bids = initialState.bids
      state.asks = initialState.asks
      state.ticker = initialState.ticker
      state.spread = initialState.spread
      state.total = initialState.total
    },
  },
})

export const { initialiseBook, updateBook } = orderBookSlice.actions

export default orderBookSlice.reducer
