import { createParser } from 'eventsource-parser'
import type { ParsedEvent, ReconnectInterval } from 'eventsource-parser'
import type { ChatMessage } from '@/types'
import { main } from '@/pages/api/azblob'

const model = import.meta.env.VITE_OPENAI_API_MODEL || 'gpt-3.5-turbo'

export const generatePayload = (apiKey: string, messages: ChatMessage[]): RequestInit & { dispatcher?: any } => ({
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  method: 'POST',
  body: JSON.stringify({
    model,
    messages,
    temperature: 0.6,
    stream: true
  }),
})

export const parseOpenAIStream = (rawResponse: Response) => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  if (!rawResponse.ok) {
    return new Response(rawResponse.body, {
      status: rawResponse.status,
      statusText: rawResponse.statusText,
    })
  }

  const stream = new ReadableStream({
    async start(controller) {
      const streamParser = (event: ParsedEvent | ReconnectInterval) => {
        console.log(event.type)
        if (event.type === 'event') {
          const data = event.data
          if (data === '[DONE]') {
            controller.close()
            return
          }
          try {
            // response = {
            //   id: 'chatcmpl-6pULPSegWhFgi0XQ1DtgA3zTa1WR6',
            //   object: 'chat.completion.chunk',
            //   created: 1677729391,
            //   model: 'gpt-3.5-turbo-0301',
            //   choices: [
            //     { delta: { content: '你' }, index: 0, finish_reason: null }
            //   ],
            // }
            const json = JSON.parse(data)
            const text = json.choices[0].delta?.content || ''
            const queue = encoder.encode(text)
            controller.enqueue(queue)
          } catch (e) {
            controller.error(e)
          }
        }
      }

      const parser = createParser(streamParser)
      for await (const chunk of rawResponse.body as any)
        parser.feed(decoder.decode(chunk))
    },
  })

  return new Response(stream)
}

export function parseOpenAIJson(rawString: string): BodyInit {
  let result = '';
  let mkUrl = '';
  let downloadUrl = '';
  let code = '';
  console.info(rawString)
  try {
    var json = JSON.parse(rawString)
    result = json.choices[0].message.content
    console.log(result)
    if (result.includes("[下载LSP文件]"))
      result = result.substring(0, result.lastIndexOf("\n"))
    console.info(result)
    if (result.includes("```")) {
      //var index1 = result.indexOf("```", 0);
      //var index2 = result.lastIndexOf("```");
      code = result.split("```")[1]
      if (code.startsWith("lisp")) {
        code = code.substring(4, code.length)
        console.info(code)
        downloadUrl = main(code);
        mkUrl = '[下载LSP文件](' + downloadUrl + ')'
        console.log(downloadUrl)
      }
      if (code.includes("defun")) {
        //code = code.substring(4, code.length)
        console.info(code)
        downloadUrl = main(code);
        mkUrl = '[下载LSP文件](' + downloadUrl + ')'
        console.log(downloadUrl)
      }
    }
  } catch (e) {

  }
  //console.log(downloadUrl)
  return result + "\n" + mkUrl

}