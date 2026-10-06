// Claude (via AWS Bedrock) as the agent's model. Server side only.
import type { CallModel } from './engine.js'
import type { Create } from '../server/bedrock.js'

export function claudeModel(create: Create, model: string): CallModel {
  return async (system, messages, tools) => {
    const out = await create({ model, max_tokens: 1500, system, messages, tools })
    return { content: out.content, stop_reason: out.stop_reason } as any
  }
}
