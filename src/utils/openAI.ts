import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser'
import type { ChatMessage } from '@/types'
import { main } from '@/pages/api/azblob'

const model = import.meta.env.OPENAI_API_MODEL || 'gpt-3.5-turbo'

export const generatePayload = (apiKey: string, messages: ChatMessage[]): RequestInit => ({
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  },
  method: 'POST',
  body: JSON.stringify({
    model,
    messages,
    temperature: 0.6,
    stream: false
  }),
})

export const parseOpenAIStream = (rawResponse: Response) => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

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
      for await (const chunk of rawResponse.body as any) {
        parser.feed(decoder.decode(chunk))
      }
    },
  })

  return stream
}

export function parseOpenAIJson(rawString: string): BodyInit {
  let result = '';
  let mkUrl = '';
  let downloadUrl = '';
  let code = '';
  console.log(rawString)
  try {
    var json = JSON.parse(rawString)
    result = json.choices[0].message.content
    if (result.includes("```")) {
      //var index1 = result.indexOf("```", 0);
      //var index2 = result.lastIndexOf("```");
      code = result.split("```")[1]
      if (code.startsWith("lisp")) {
        code = code.substring(4, code.length)
        console.log('start upload')
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