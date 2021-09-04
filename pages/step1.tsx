import {parse} from 'cookie'
import {getAsync, getDataFromRedis} from '../lib/redis'
import {useRedisKey} from '../context/redis-key-context'
import type {NextApiRequest} from 'next'
import Router from 'next/router'
import * as React from 'react'

export type Step = {
  title: string
  content: string
}

function StepOne({step1}: {step1: Step}) {
  const redisKey = useRedisKey()
  async function handleStepNext() {
    const data = {
      key: redisKey.key,
      hmKey: 'steps:1',
      data: {
        title: 'Step1',
        content: 'Content of step1',
      },
    }

    await fetch('api/your-data', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    Router.push('/step2')
  }
  return (
    <div>
      <section>
        <h1>Data from StepOne</h1>
        <p>{step1?.title}</p>
        <p>{step1?.content}</p>
      </section>
      <button onClick={handleStepNext}>Next step</button>
    </div>
  )
}

export async function getServerSideProps({req}: {req: NextApiRequest}) {
  if (req.headers.cookie !== undefined) {
    const cookie = parse(req.headers.cookie)

    if (cookie.refreshKey) {
      const key = await getAsync(cookie.refreshKey)

      if (typeof key === 'string') {
        const {shouldRedirect, data} = await getDataFromRedis(key, [
          {
            hmKey: 'steps:1',
            path: '/step1',
            isCurrent: true,
          },
        ])

        if (!shouldRedirect) {
          const step1 = data ? data[0] : null
          return {
            props: {
              step1,
            },
          }
        }
      }
    }
  }

  return {
    props: {
      step1: {},
    },
  }
}

export default StepOne
