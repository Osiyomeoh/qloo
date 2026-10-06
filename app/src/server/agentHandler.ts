// POST /api/agent: runs the agent until it needs the person (or finishes).
// The browser holds the conversation and sends it back; nothing is stored here.
import { runAgent, resume, type AgentState, type Pending, type CallModel } from '../agent/engine.js'
import { SYSTEM, unspokenTools, openingMessage } from '../agent/unspoken.js'
import { anthropicModel } from '../agent/anthropic.js'
import { SampleClient, type QlooClient } from '../qloo/client.js'
import { ServerQlooClient } from './qlooServer.js'

export interface AgentRequest {
  start?: { seeds: { id: string; name: string }[]; notes?: string }
  state?: AgentState
  pending?: Pending
  result?: unknown
}

const MAX_BODY = 400_000

export async function handleAgent(raw: string, env: { ANTHROPIC_API_KEY?: string; QLOO_API_KEY?: string; AGENT_MODEL?: string }, deps: { callModel?: CallModel; qloo?: QlooClient } = {}): Promise<Response> {
  if (raw.length > MAX_BODY) return json(413, { error: 'session too long; start a new one' })
  const callModel = deps.callModel ?? (env.ANTHROPIC_API_KEY ? anthropicModel(env.ANTHROPIC_API_KEY, env.AGENT_MODEL || undefined) : undefined)
  if (!callModel) return json(503, { error: 'The agent is not configured on this deployment' })
  const qloo = deps.qloo ?? (env.QLOO_API_KEY ? new ServerQlooClient(env.QLOO_API_KEY) : new SampleClient())

  let req: AgentRequest
  try { req = JSON.parse(raw) } catch { return json(400, { error: 'bad json' }) }

  let state: AgentState
  if (req.start) {
    const seeds = (req.start.seeds ?? []).filter(s => typeof s?.id === 'string' && typeof s?.name === 'string').slice(0, 10)
    if (!seeds.length) return json(400, { error: 'add at least one favourite first' })
    state = { messages: [openingMessage(seeds, String(req.start.notes ?? '').slice(0, 500))], steps: 0, toolCalls: 0 }
  } else if (req.state && req.pending) {
    state = resume(req.state, req.pending, req.result ?? null)
  } else return json(400, { error: 'send start, or state + pending + result' })

  const { server, client } = unspokenTools(qloo)
  try {
    const out = await runAgent({ system: SYSTEM, serverTools: server, clientTools: client, callModel }, state)
    return json(200, { ...out, qlooMode: qloo.mode })
  } catch (e) {
    return json(502, { error: (e as Error).message })
  }
}

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
