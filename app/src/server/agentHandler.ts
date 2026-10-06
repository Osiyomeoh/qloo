// POST /api/agent: runs the agent until it needs the person (or finishes).
// The browser holds the conversation and sends it back; nothing is stored here.
import { runAgent, resume, type AgentState, type Pending, type CallModel } from '../agent/engine.js'
import { SYSTEM, unspokenTools, openingMessage } from '../agent/unspoken.js'
import { historyBrief } from '../core/history.js'
import { claudeModel } from '../agent/anthropic.js'
import { bedrockConfigured, bedrockCreate, DEFAULT_AGENT_MODEL, type BedrockEnv } from './bedrock.js'
import { SampleClient, type QlooClient } from '../qloo/client.js'
import { ServerQlooClient } from './qlooServer.js'

export interface AgentRequest {
  start?: { seeds: { id: string; name: string }[]; notes?: string; history?: { sessions?: number; favourites?: string[]; neverChosen?: string[] } }
  state?: AgentState
  pending?: Pending
  result?: unknown
}

const MAX_BODY = 400_000

export async function handleAgent(raw: string, env: BedrockEnv & { QLOO_API_KEY?: string }, deps: { callModel?: CallModel; qloo?: QlooClient } = {}): Promise<Response> {
  if (raw.length > MAX_BODY) return json(413, { error: 'session too long; start a new one' })
  const callModel = deps.callModel ?? (bedrockConfigured(env) ? claudeModel(bedrockCreate(env), env.BEDROCK_AGENT_MODEL || DEFAULT_AGENT_MODEL) : undefined)
  if (!callModel) return json(503, { error: 'The agent is not configured on this deployment' })
  const qloo = deps.qloo ?? (env.QLOO_API_KEY ? new ServerQlooClient(env.QLOO_API_KEY) : new SampleClient())

  let req: AgentRequest
  try { req = JSON.parse(raw) } catch { return json(400, { error: 'bad json' }) }

  let state: AgentState
  if (req.start) {
    const seeds = (req.start.seeds ?? []).filter(s => typeof s?.id === 'string' && typeof s?.name === 'string').slice(0, 10)
    if (!seeds.length) return json(400, { error: 'add at least one favourite first' })
    state = { messages: [openingMessage(seeds, String(req.start.notes ?? '').slice(0, 500), brief(req.start.history))], steps: 0, toolCalls: 0 }
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

const names = (v: unknown) => (Array.isArray(v) ? v : []).filter((x): x is string => typeof x === 'string').map(x => x.slice(0, 120)).slice(0, 20)
function brief(h: unknown): string {
  const o = (h ?? {}) as { sessions?: unknown; favourites?: unknown; neverChosen?: unknown }
  const sessions = typeof o.sessions === 'number' ? Math.max(0, Math.min(99, Math.trunc(o.sessions))) : 0
  return historyBrief({ sessions, favourites: names(o.favourites), neverChosen: names(o.neverChosen) })
}
