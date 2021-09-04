import redis from 'redis'
const client = redis.createClient({
  url: process.env.REDIS_URL as string,
})

client.on('error', function (error) {
  console.error(error)
})

async function setAsync(key: string, value: string) {
  return new Promise((resolve) => {
    client.set(key, value, (error, reply) => {
      if (error) {
        console.log(`REDIS get error with SET: ${key}`, error)
      }

      resolve(reply)
      client.expire(key, 60 * 60 * 24)
    })
  })
}

async function getAsync(key: string) {
  return new Promise((resolve) => {
    client.get(key, (error, reply) => {
      if (error) {
        console.log(`REDIS get error with SET: ${key}`, error)
      }

      resolve(reply)
    })
  })
}

async function hmSetAsync(key: string, field: string, data: string) {
  return new Promise((resolve) => {
    client.hmset(key, field, data, (error, reply) => {
      if (error) {
        console.log(`REDIS get error with HMSET: ${key}`, error)
      }

      resolve(reply)
      client.expire(key, 60 * 60 * 24)
    })
  })
}

async function hmGetAsync(key: string, field: string) {
  return new Promise((resolve) => {
    client.hmget(key, field, (error, reply) => {
      if (error) {
        console.log(`REDIS get error with HMGET: ${key}`, error)
      }

      resolve(reply)
    })
  })
}

type ScreenConfig = {
  hmKey: string
  path: string
  isCurrent?: boolean
}

async function getDataFromRedis(key: string, configs: Array<ScreenConfig>) {
  const data = (
    await Promise.all(configs.map(({hmKey}) => hmGetAsync(key, hmKey)))
  )
    .flat()
    .map((d) => (typeof d === 'string' ? JSON.parse(d) : d))

  // we don't need to check data in the current page.
  const haveAllData = data.every((d, idx) => configs[idx].isCurrent ?? d)

  if (haveAllData) {
    return {
      shouldRedirect: false,
      data,
    }
  }

  // redirect to the previous step that doesn't have data.
  const index = data.findIndex((d) => !d)
  const redirectPath = configs[index].path
  return {
    shouldRedirect: true,
    redirectPath,
  }
}

export {setAsync, hmSetAsync, getAsync, hmGetAsync, getDataFromRedis}
