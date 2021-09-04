// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type {NextApiRequest, NextApiResponse} from 'next'
import {parse} from 'cookie'
import {hmSetAsync} from '../../lib/redis'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!req.headers.cookie) {
    return responseError(res, 'Hmm, Something wrong with your refreshKey.')
  } else {
    const cookie = parse(req.headers.cookie)

    if (!cookie.refreshKey) {
      return responseError(res, 'Hmm, Something wrong with your refreshKey.')
    }
  }

  const {hmKey, key, data} = JSON.parse(req.body)

  if (!hmKey) {
    return responseError(res, 'A hashmap key is required.')
  }

  if (!key) {
    return responseError(res, 'A key is required.')
  }

  if (!data) {
    return responseError(res, 'Data is required.')
  }

  await hmSetAsync(key, hmKey, JSON.stringify(data))
  res.status(200).json({data})
}

function responseError(res: NextApiResponse, message: string) {
  return res.status(404).json({message})
}
