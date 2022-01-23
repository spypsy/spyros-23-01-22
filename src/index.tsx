import React from 'react'
import ReactDOM from 'react-dom'
import { Provider as ReduxProvider } from 'react-redux'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'

import App from './App'
import theme from './theme'
import { store } from './store'

import './index.css'

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ReduxProvider store={store}>
        <App />
      </ReduxProvider>
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)
