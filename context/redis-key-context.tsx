import * as React from 'react'
import useSWR from 'swr'

type RedisKeyContextType = {
  key: string
}
const RedisKeyContext = React.createContext<RedisKeyContextType | null>(null)
const fetcher = (args: string) => fetch(args).then((res) => res.json())

function RedisKeyProvider({children}: {children: React.ReactNode}) {
  const {data, error} = useSWR('api/your-key', fetcher)
  const value = React.useMemo(() => data, [data])
  if (error) {
    return <div>Hmm, Something wrong with your key.</div>
  }

  return (
    <RedisKeyContext.Provider value={value}>
      {children}
    </RedisKeyContext.Provider>
  )
}

function useRedisKey() {
  const context = React.useContext(RedisKeyContext)

  if (context === null) {
    throw new Error(`useRedisKey must be used within a RedisKeyProvider.`)
  }

  return context
}

export {RedisKeyProvider, useRedisKey}
