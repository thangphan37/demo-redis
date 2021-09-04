// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type {NextApiRequest, NextApiResponse} from 'next'
import {parse, serialize, CookieSerializeOptions} from 'cookie'
import {getAsync, setAsync} from '../../lib/redis'
import {v4 as uuidv4} from 'uuid'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.headers.cookie !== undefined) {
    const cookie = parse(req.headers.cookie)

    if (cookie.refreshKey) {
      const key = await getAsync(cookie.refreshKey)
      console.log('key', key)
      return res.status(200).json({key})
    }
  }

  const refreshKey = uuidv4()
  const key = uuidv4()

  const start = Date.now()
  await setAsync(refreshKey, key)

  // sync time expire between redis and cookie
  const timeForRedis = Math.floor(Date.now() - start) / 1000
  setCookie(res, 'refreshKey', refreshKey, {
    maxAge: 60 * 60 * 24 - timeForRedis,
  })
  res.status(200).json({key})
}

export const setCookie = (
  res: NextApiResponse,
  name: string,
  value: unknown,
  options: CookieSerializeOptions = {},
) => {
  const stringValue =
    typeof value === 'object' ? 'j:' + JSON.stringify(value) : String(value)

  if (options.maxAge) {
    options.expires = new Date(Date.now() + options.maxAge)
    // options.maxAge /= 1000
    options.path = '/'
  }

  res.setHeader('Set-Cookie', serialize(name, String(stringValue), options))
}
