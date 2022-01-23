import { useState, useEffect } from 'react'
import _debounce from 'lodash.debounce'

const getWindowDimensions = () => {
  const { innerWidth: width, innerHeight: height } = window
  return {
    width,
    height,
  }
}

const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions(),
  )

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions())
    }

    window.addEventListener('resize', _debounce(handleResize, 100))
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowDimensions
}

export default useWindowDimensions
