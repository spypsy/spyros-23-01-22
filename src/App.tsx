import React, { useEffect, useState } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { Spinner, Button, Center } from '@chakra-ui/react'

import './App.css'

import { FEED_URL } from './constants'
import { APIEvent, Ticker, TickerProductId } from './types'
import useOrderBook from './hooks/useOrderbook'
import Orderbook from './components/Orderbook'

const App = () => {
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    FEED_URL,
    {
      onOpen: () => console.log('socket open'),
      onClose: () => console.log('socket close'),
    },
  )

  const [isToggling, setIsToggling] = useState<boolean>(false)

  const { initialiseBook, updateBook, currentTicker, bids, asks, spread } =
    useOrderBook()

  // toggle ticker function
  const onToggleTicker = () => {
    if (readyState === ReadyState.OPEN && !isToggling) {
      setIsToggling(true)
      // send message to unsubscribe from current ticker
      const productId = TickerProductId[currentTicker]
      sendJsonMessage({
        event: 'unsubscribe',
        feed: 'book_ui_1',
        product_ids: [productId],
      })
    }
  }

  // initialise book state
  useEffect(() => {
    if (lastJsonMessage !== null && lastJsonMessage !== undefined) {
      // check it's not a standard event
      if (!lastJsonMessage.event && !isToggling) {
        // initialise with snapshot
        if (lastJsonMessage.feed === APIEvent.snapshot) {
          initialiseBook({
            bids: lastJsonMessage.bids,
            asks: lastJsonMessage.asks,
            ticker:
              lastJsonMessage.product_id === TickerProductId.BTC
                ? Ticker.BTC
                : Ticker.ETH,
          })
        }
      }
    }
  })

  // update book state
  useEffect(() => {
    if (lastJsonMessage !== null && lastJsonMessage !== undefined) {
      // check it's not a standard event
      if (!lastJsonMessage?.event && !isToggling) {
        // initialise with snapshot
        if (lastJsonMessage.feed === APIEvent.update) {
          updateBook({
            bids: lastJsonMessage.bids,
            asks: lastJsonMessage.asks,
          })
        }
      }
    }
  }, [initialiseBook, updateBook, lastJsonMessage, isToggling, setIsToggling])

  // flip isToggling flag once we're subscribed to feed
  useEffect(() => {
    if (lastJsonMessage !== null && lastJsonMessage !== undefined) {
      if (isToggling && lastJsonMessage.event === 'subscribed') {
        setIsToggling(false)
      }
    }
  }, [lastJsonMessage, isToggling, setIsToggling])

  useEffect(() => {
    if (lastJsonMessage !== null && lastJsonMessage !== undefined) {
      // if we're in 'toggling' state, check for unsubscribed message
      if (isToggling && lastJsonMessage.event === 'unsubscribed') {
        // re-subscribe to new ticker
        const productId =
          TickerProductId[
            currentTicker === Ticker.BTC ? Ticker.ETH : Ticker.BTC
          ]
        sendJsonMessage({
          event: 'subscribe',
          feed: 'book_ui_1',
          product_ids: [productId],
        })
      }
    }
  }, [isToggling, lastJsonMessage, currentTicker, sendJsonMessage])

  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      sendJsonMessage({
        event: 'subscribe',
        feed: 'book_ui_1',
        product_ids: [TickerProductId.BTC],
      })
    }
  }, [readyState, sendJsonMessage])

  if (readyState === ReadyState.CONNECTING) {
    return <Spinner size="xl" />
  }

  return (
    <div className="App">
      <Orderbook bids={bids} asks={asks} spread={spread} />
      <Center>
        <Button className="toggle-" onClick={onToggleTicker}>
          Toggle Feed
        </Button>
      </Center>
    </div>
  )
}

export default App
