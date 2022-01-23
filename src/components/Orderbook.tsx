import { Center } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import useWindowDimensions from '../hooks/useWindowDimensions'

import { BookSide, MarketLevel } from '../types'

interface OrderBookProps {
  bids: MarketLevel[]
  asks: MarketLevel[]
  spread: number
}

const MOBILE_WIDTH = 525
const ROWS = 25

const progressBarStyles = (
  sizePercentage: number,
  bookSide: BookSide,
  isMobileView: boolean,
): Object => ({
  position: 'absolute',
  top: '0px',
  height: '22px',
  width: '100%',
  opacity: 0.2,

  ...(bookSide === BookSide.bid
    ? {
        ...(isMobileView
          ? { right: '100%', transform: `translateX(${sizePercentage}%)` }
          : { left: '100%', transform: `translateX(-${sizePercentage}%)` }),
        backgroundColor: 'green',
      }
    : {
        right: '100%',
        transform: `translateX(${sizePercentage}%)`,
        backgroundColor: 'red',
      }),
})

const Orderbook = ({ bids, asks, spread }: OrderBookProps) => {
  const maxTotal = Math.max(bids[ROWS - 1]?.total, asks[ROWS - 1]?.total)

  const { width } = useWindowDimensions()
  const [isMobileView, setIsMobileView] = useState<boolean>(
    width < MOBILE_WIDTH,
  )

  // effect to set whether we're on mobile view or not
  useEffect(() => {
    if (width < MOBILE_WIDTH && !isMobileView) {
      setIsMobileView(true)
    } else if (width > MOBILE_WIDTH && isMobileView) {
      setIsMobileView(false)
    }
  }, [width, isMobileView, setIsMobileView])

  return (
    <>
      <div style={{ borderBottom: '1px solid white', padding: '6px' }}>
        <span
          style={{
            ...(!isMobileView && { float: 'left', position: 'absolute' }),
          }}
        >
          Order Book
        </span>
        {!isMobileView && (
          <Center>
            <span style={{ paddingLeft: '-5px' }}>SPREAD: {spread}</span>
          </Center>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: isMobileView ? 'column' : 'row',
        }}
      >
        {isMobileView && (
          <Center style={{ padding: '4px' }}>
            <span style={{ paddingLeft: '-5px' }}>SPREAD: {spread}</span>
          </Center>
        )}
        <div
          className="bid-side"
          style={{ width: isMobileView ? '100%' : '50%' }}
        >
          {!isMobileView && (
            <div
              className="header"
              style={{ display: 'flex', justifyContent: 'space-evenly' }}
            >
              <div style={{ width: '33%', textAlign: 'center' }}>TOTAL</div>
              <div style={{ width: '33%', textAlign: 'center' }}>SIZE</div>
              <div style={{ width: '33%', textAlign: 'center' }}>PRICE</div>
            </div>
          )}
          <div className="items">
            {bids.slice(0, ROWS).map(({ total, size, price }) => {
              const sizePercentage = (total / maxTotal) * 100
              return (
                <div
                  style={{ position: 'relative', overflow: 'hidden' }}
                  key={price}
                >
                  <div
                    style={{ display: 'flex', justifyContent: 'space-evenly' }}
                  >
                    <div
                      style={{
                        width: '33%',
                        textAlign: 'center',
                        order: isMobileView ? '3' : '1',
                      }}
                    >
                      {total.toLocaleString()}
                    </div>
                    <div
                      style={{
                        width: '33%',
                        textAlign: 'center',
                        order: isMobileView ? '2' : '1',
                      }}
                    >
                      {size.toLocaleString()}
                    </div>
                    <div
                      style={{
                        width: '33%',
                        textAlign: 'center',
                        order: isMobileView ? '1' : '1',
                      }}
                    >
                      {price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                  <div
                    className="progress-bar"
                    style={progressBarStyles(
                      sizePercentage,
                      BookSide.bid,
                      isMobileView,
                    )}
                  />
                </div>
              )
            })}
          </div>
        </div>
        <div
          className="ask-side"
          style={{
            width: isMobileView ? '100%' : '50%',
            order: isMobileView ? '-1' : '1',
          }}
        >
          <div
            className="header"
            style={{ display: 'flex', justifyContent: 'space-evenly' }}
          >
            <div style={{ width: '33%', textAlign: 'center' }}>PRICE</div>
            <div style={{ width: '33%', textAlign: 'center' }}>SIZE</div>
            <div style={{ width: '33%', textAlign: 'center' }}>TOTAL</div>
          </div>
          <div className="items">
            {asks

              .slice(0, ROWS)
              .sort(({ price: price1 }, { price: price2 }) =>
                isMobileView ? price2 - price1 : price1 - price2,
              )
              .map(({ total, size, price }) => {
                const sizePercentage = (total / maxTotal) * 100
                return (
                  <div
                    style={{ position: 'relative', overflow: 'hidden' }}
                    key={price}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-evenly',
                      }}
                    >
                      <div style={{ width: '33%', textAlign: 'center' }}>
                        {price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                      <div style={{ width: '33%', textAlign: 'center' }}>
                        {size.toLocaleString()}
                      </div>
                      <div style={{ width: '33%', textAlign: 'center' }}>
                        {total.toLocaleString()}
                      </div>
                    </div>
                    <div
                      className="progress-bar"
                      style={progressBarStyles(
                        sizePercentage,
                        BookSide.ask,
                        isMobileView,
                      )}
                    />
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </>
  )
}

export default Orderbook
