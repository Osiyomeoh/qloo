// A small, testable agent loop over the Anthropic Messages tool-use format.
// The model decides which tool to call next. Server tools run here; client tools
// (things only a person can do, like showing cards to a child) pause the loop and
// hand control to the UI, which resumes it with the person's result.
// Stateless between requests so it runs on serverless functions.

export type Block =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: unknown }
  | { type: 'tool_result'; tool_use_id: string; content: string; is_error?: boolean }

export interface Msg { role: 'user' | 'assistant'; content: string | Block[] }
export interface ToolDef { name: string; description: string; input_schema: Record<string, unknown> }
export interface ServerTool extends ToolDef { run(input: unknown): Promise<unknown> }
export interface ClientTool extends ToolDef {
  /** Return an error message to send back to the model, or null if the call is valid. */
  validate?(input: unknown, messages: Msg[]): string | null
}
export interface ModelReply { content: Block[]; stop_reason: string }
export type CallModel = (system: string, messages: Msg[], tools: ToolDef[]) => Promise<ModelReply>

export interface TraceEvent { step: number; kind: 'thought' | 'tool' | 'result' | 'error' | 'ask' | 'done'; text: string; data?: unknown }
export interface Pending { id: string; name: string; input: unknown; carry: Block[] }

export interface AgentState { messages: Msg[]; steps: number; toolCalls: number }
export interface AgentOutput extends AgentState { trace: TraceEvent[]; pending?: Pending; done?: { text: string; reason: 'finished' | 'step_limit' | 'tool_limit' } }

export interface AgentConfig {
  system: string
  serverTools: ServerTool[]
  clientTools: ClientTool[]
  callModel: CallModel
  maxSteps?: number // model turns per whole session
  maxToolCalls?: number // server tool calls per whole session (protects the Qloo quota)
}

const MAX_RESULT_CHARS = 6000
const short = (s: string, n = 160) => (s.length > n ? s.slice(0, n - 1) + '…' : s)

/** Resume after a client tool: add its result (plus any carried server results) as the next user turn. */
export function resume(state: AgentState, pending: Pending, result: unknown): AgentState {
  const content: Block[] = [...pending.carry, { type: 'tool_result', tool_use_id: pending.id, content: JSON.stringify(result) }]
  return { ...state, messages: [...state.messages, { role: 'user', content }] }
}

export async function runAgent(cfg: AgentConfig, start: AgentState): Promise<AgentOutput> {
  const maxSteps = cfg.maxSteps ?? 16
  const maxToolCalls = cfg.maxToolCalls ?? 24
  const tools: ToolDef[] = [...cfg.serverTools, ...cfg.clientTools].map(({ name, description, input_schema }) => ({ name, description, input_schema }))
  const byName = new Map<string, ServerTool | ClientTool>([...cfg.serverTools, ...cfg.clientTools].map(t => [t.name, t]))
  const isServer = new Set(cfg.serverTools.map(t => t.name))
  const messages = [...start.messages]
  let { steps, toolCalls } = start
  const trace: TraceEvent[] = []

  while (steps < maxSteps) {
    const reply = await cfg.callModel(cfg.system, messages, tools)
    steps++
    messages.push({ role: 'assistant', content: reply.content })
    for (const b of reply.content) if (b.type === 'text' && b.text.trim()) trace.push({ step: steps, kind: 'thought', text: b.text.trim() })

    const uses = reply.content.filter((b): b is Extract<Block, { type: 'tool_use' }> => b.type === 'tool_use')
    if (!uses.length) {
      const text = reply.content.filter(b => b.type === 'text').map(b => (b as { text: string }).text).join('\n').trim()
      trace.push({ step: steps, kind: 'done', text: short(text || 'Finished') })
      return { messages, steps, toolCalls, trace, done: { text, reason: 'finished' } }
    }

    const results: Block[] = []
    let pending: Pending | undefined
    for (const u of uses) {
      const tool = byName.get(u.name)
      if (!tool) { results.push({ type: 'tool_result', tool_use_id: u.id, content: `Unknown tool ${u.name}`, is_error: true }); continue }
      if (isServer.has(u.name)) {
        if (toolCalls >= maxToolCalls) {
          results.push({ type: 'tool_result', tool_use_id: u.id, content: 'Tool budget for this session is used up. Finish with what you have.', is_error: true })
          trace.push({ step: steps, kind: 'error', text: 'Tool budget reached' })
          continue
        }
        toolCalls++
        trace.push({ step: steps, kind: 'tool', text: `${u.name} ${short(JSON.stringify(u.input), 120)}`, data: { name: u.name, input: u.input } })
        try {
          const out = await (tool as ServerTool).run(u.input)
          const s = JSON.stringify(out)
          results.push({ type: 'tool_result', tool_use_id: u.id, content: s.length > MAX_RESULT_CHARS ? s.slice(0, MAX_RESULT_CHARS) : s })
          trace.push({ step: steps, kind: 'result', text: summarise(out), data: out })
        } catch (e) {
          const msg = (e as Error).message
          results.push({ type: 'tool_result', tool_use_id: u.id, content: `Error: ${msg}`, is_error: true })
          trace.push({ step: steps, kind: 'error', text: `${u.name}: ${short(msg)}` })
        }
      } else {
        const err = pending ? 'Only one person-facing action at a time. Call it again after this one returns.' : (tool as ClientTool).validate?.(u.input, messages) ?? null
        if (err) {
          results.push({ type: 'tool_result', tool_use_id: u.id, content: `Error: ${err}`, is_error: true })
          trace.push({ step: steps, kind: 'error', text: `${u.name} refused: ${short(err)}` })
        } else {
          pending = { id: u.id, name: u.name, input: u.input, carry: [] }
          trace.push({ step: steps, kind: 'ask', text: u.name, data: u.input })
        }
      }
    }
    if (pending) {
      pending.carry = results
      return { messages, steps, toolCalls, trace, pending }
    }
    messages.push({ role: 'user', content: results })
  }
  trace.push({ step: steps, kind: 'done', text: 'Step limit reached' })
  return { messages, steps, toolCalls, trace, done: { text: '', reason: 'step_limit' } }
}

function summarise(out: unknown): string {
  const o = out as { entities?: { name: string }[]; note?: string }
  if (Array.isArray(o?.entities)) return o.entities.length ? `${o.entities.length}: ${short(o.entities.slice(0, 5).map(e => e.name).join(', '), 140)}` : 'no results'
  return short(JSON.stringify(out), 140)
}

/** Every id that has appeared in a user turn (seeds) or a tool result. Used to stop the model inventing items. */
export function knownIds(messages: Msg[]): Set<string> {
  const ids = new Set<string>()
  const scan = (s: string) => { for (const m of s.matchAll(/"id"\s*:\s*"([^"]+)"/g)) ids.add(m[1]) }
  for (const m of messages) {
    if (m.role !== 'user') continue
    if (typeof m.content === 'string') scan(m.content)
    else for (const b of m.content) if (b.type === 'tool_result' && !b.is_error) scan(b.content)
  }
  return ids
}
