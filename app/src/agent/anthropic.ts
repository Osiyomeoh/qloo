// Anthropic Messages API as the agent's model. Server side only.
import type { CallModel, ModelReply } from './engine.js'

export const AGENT_MODEL = 'claude-opus-5-5'

export function anthropicModel(apiKey: string, model = AGENT_MODEL, f: typeof fetch = fetch): CallModel {
  return async (system, messages, tools) => {
    const res = await f('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model, max_tokens: 1500, system, messages, tools }),
      signal: AbortSignal.timeout(60_000),
    }).catch(() => undefined)
    if (!res) throw new Error('model did not respond')
    if (!res.ok) throw new Error(`model error ${res.status}`)
    const out = (await res.json()) as ModelReply
    return { content: out.content, stop_reason: out.stop_reason }
  }
}
