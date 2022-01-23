import { configureStore } from '@reduxjs/toolkit'

import orderBookReducer from './state/orderBook'

export const store = configureStore({
  reducer: {
    orderBook: orderBookReducer,
  },
})
