import '../styles/globals.css'
import type {AppProps} from 'next/app'
import {RedisKeyProvider} from '../context/redis-key-context'

function MyApp({Component, pageProps}: AppProps) {
  return (
    <RedisKeyProvider>
      <Component {...pageProps} />
    </RedisKeyProvider>
  )
}
export default MyApp
