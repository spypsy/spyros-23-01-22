import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  OrderBookState,
  initialiseBook as initialiseBookAction,
  updateBook as updateBookAction,
} from '../state/orderBook'
import { APIOrderBook, MarketLevel, Ticker } from '../types'

interface OrderBookData {
  initialiseBook: (payload: APIOrderBook) => void
  updateBook: (payload: APIOrderBook) => void
  currentTicker: Ticker
  bids: MarketLevel[]
  asks: MarketLevel[]
  spread: number
  total: number
}

const useOrderBook = (): OrderBookData => {
  const dispatch = useDispatch()

  const {
    ticker: currentTicker,
    bids,
    asks,
    spread,
    total,
  } = useSelector((state: { orderBook: OrderBookState }) => state.orderBook)

  const initialiseBook = useCallback(
    data => dispatch(initialiseBookAction(data)),
    [dispatch],
  )

  const updateBook = useCallback(
    data => dispatch(updateBookAction(data)),
    [dispatch],
  )

  return {
    initialiseBook,
    updateBook,
    currentTicker,
    bids,
    asks,
    spread,
    total,
  }
}

export default useOrderBook
