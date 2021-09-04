import {parse} from 'cookie'
import {getAsync, getDataFromRedis} from '../lib/redis'
import {useRedisKey} from '../context/redis-key-context'
import type {NextApiRequest} from 'next'
import type {Step} from './step1'
import * as React from 'react'

function StepTwo({step1, step2}: {step1: Step; step2: Step}) {
  const redisKey = useRedisKey()
  async function makeStep2Data() {
    const data = {
      key: redisKey.key,
      hmKey: 'steps:2',
      data: {
        title: 'Step2',
        content: 'Content of step2',
      },
    }

    await fetch('api/your-data', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  return (
    <div>
      <section>
        <h1>Data from StepOne</h1>
        <p>{step1?.title}</p>
        <p>{step1?.content}</p>
      </section>
      <section>
        <h1>Data of StepTwo</h1>
        <p>{step2?.title}</p>
        <p>{step2?.content}</p>
      </section>
      <button onClick={makeStep2Data}>Make</button>
    </div>
  )
}

export async function getServerSideProps({req}: {req: NextApiRequest}) {
  if (req.headers.cookie !== undefined) {
    const cookie = parse(req.headers.cookie)

    if (cookie.refreshKey) {
      const key = await getAsync(cookie.refreshKey)

      if (typeof key === 'string') {
        const {shouldRedirect, data, redirectPath} = await getDataFromRedis(
          key,
          [
            {
              hmKey: 'steps:1',
              path: '/step1',
            },
            {
              hmKey: 'steps:2',
              path: '/step2',
              isCurrent: true,
            },
          ],
        )

        // redirect to the previous step.
        if (shouldRedirect) {
          return {
            redirect: {
              destination: redirectPath,
              permanent: false,
            },
          }
        }

        const step1 = data ? data[0] : null
        const step2 = data ? data[1] : null
        return {
          props: {
            step1,
            step2,
          },
        }
      }
    }
  }

  return {
    redirect: {
      destination: '/step1',
      permanent: false,
    },
  }
}

export default StepTwo
