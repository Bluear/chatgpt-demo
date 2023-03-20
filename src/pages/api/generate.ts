<<<<<<< HEAD
import type { APIRoute } from 'astro'
import { generatePayload, parseOpenAIStream, parseOpenAIJson } from '@/utils/openAI'
=======
// #vercel-disable-blocks
import { ProxyAgent, fetch } from 'undici'
// #vercel-end
import { generatePayload, parseOpenAIStream } from '@/utils/openAI'
>>>>>>> ec248e3dac454bf52912aa6c07b9fd19d21ef4e0
import { verifySignature } from '@/utils/auth'
import type { APIRoute } from 'astro'



const apiKey = import.meta.env.OPENAI_API_KEY
const httpsProxy = import.meta.env.HTTPS_PROXY
const baseUrl = (import.meta.env.OPENAI_API_BASE_URL || 'https://api.openai.com').trim().replace(/\/$/, '')
const sitePassword = import.meta.env.SITE_PASSWORD

<<<<<<< HEAD


export const post: APIRoute = async (context) => {
=======
export const post: APIRoute = async(context) => {
>>>>>>> ec248e3dac454bf52912aa6c07b9fd19d21ef4e0
  const body = await context.request.json()
  const { sign, time, messages, pass } = body
  console.log(messages)
  if (!messages) {
    return new Response(JSON.stringify({
      error: {
        message: 'No input text.',
      },
    }), { status: 400 })
  }
  if (sitePassword && sitePassword !== pass) {
    return new Response(JSON.stringify({
      error: {
        message: 'Invalid password.',
      },
    }), { status: 401 })
  }
  if (import.meta.env.PROD && !await verifySignature({ t: time, m: messages?.[messages.length - 1]?.content || '' }, sign)) {
    return new Response(JSON.stringify({
      error: {
        message: 'Invalid signature.',
      },
    }), { status: 401 })
  }
  const initOptions = generatePayload(apiKey, messages)
  // #vercel-disable-blocks
  if (httpsProxy)
    initOptions.dispatcher = new ProxyAgent(httpsProxy)
  // #vercel-end

<<<<<<< HEAD
  // @ts-ignore
  const response = await fetch(`${baseUrl}/v1/chat/completions`, initOptions) as Response
  return new Response(await parseOpenAIJson(await response.text()))
  //return new Response(parseOpenAIStream(response))
=======
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const response = await fetch(`${baseUrl}/v1/chat/completions`, initOptions).catch((err: Error) => {
    console.error(err)
    return new Response(JSON.stringify({
      error: {
        code: err.name,
        message: err.message,
      },
    }), { status: 500 })
  }) as Response

  return parseOpenAIStream(response) as Response
>>>>>>> ec248e3dac454bf52912aa6c07b9fd19d21ef4e0
}



