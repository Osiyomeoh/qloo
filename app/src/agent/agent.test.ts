import { describe, it, expect } from 'vitest'
import { runAgent, resume, type CallModel, type ModelReply, type Block, type Msg } from './engine'
import { SYSTEM, unspokenTools, openingMessage, cardIds } from './unspoken'
import { SampleClient } from '../qloo/client'
import { handleAgent } from '../server/agentHandler'

const use = (id: string, name: string, input: unknown): Block => ({ type: 'tool_use', id, name, input })
const say = (text: string): Block => ({ type: 'text', text })
/** Scripted model: returns replies in order and records what it was sent. */
function scripted(replies: ModelReply[]) {
  const seen: Msg[][] = []
  const call: CallModel = async (_s, messages) => { seen.push(structuredClone(messages)); const r = replies.shift(); if (!r) throw new Error('script ran out'); return r }
  return { call, seen }
}
const turn = (...content: Block[]): ModelReply => ({ content, stop_reason: content.some(b => b.type === 'tool_use') ? 'tool_use' : 'end_turn' })
const seeds = [{ id: 'sample-0001', name: 'Thomas & Friends' }]
const tools = () => unspokenTools(new SampleClient())

describe('agent loop', () => {
  it('plans with Qloo, pauses for the person, resumes with their choice, and finishes', async () => {
    const m = scripted([
      turn(say('Start near trains.'), use('t1', 'qloo_recommend', { type: 'tv_show', seed_ids: ['sample-0001'] })),
      turn(use('t2', 'present_choice', { items: [{ id: 'sample-0001', name: 'Thomas & Friends' }, { id: 'sample-0003', name: 'Chuggington' }], why: 'A favourite next to a close match.' })),
      turn(say('He chose Chuggington.'), use('t3', 'finish', { summary: 'Chuggington is a new pick.', new_favourite_ids: [] })),
    ])
    const { server, client } = tools()
    const cfg = { system: SYSTEM, serverTools: server, clientTools: client, callModel: m.call }
    let out = await runAgent(cfg, { messages: [openingMessage(seeds, '')], steps: 0, toolCalls: 0 })
    expect(out.pending?.name).toBe('present_choice')
    expect(out.trace.map(t => t.kind)).toEqual(['thought', 'tool', 'result', 'ask'])
    expect(out.trace[2].text).toMatch(/Chuggington/)

    out = await runAgent(cfg, resume(out, out.pending!, { chosen_id: 'sample-0003', engagement_seconds: 40, reactions: ['smile'] }))
    expect(out.pending?.name).toBe('finish')
    // the model saw the person's result as a tool_result for its own call
    const last = m.seen[2].at(-1)!.content as Block[]
    expect(last).toContainEqual({ type: 'tool_result', tool_use_id: 't2', content: expect.stringContaining('sample-0003') })
  })

  it('refuses to show items that did not come from the carer or Qloo, and tells the model why', async () => {
    const m = scripted([
      turn(use('t1', 'present_choice', { items: [{ id: 'sample-0001', name: 'Thomas' }, { id: 'made-up-999', name: 'Train Party 3' }], why: 'x' })),
      turn(say('Understood, I will search first.')),
    ])
    const { server, client } = tools()
    const out = await runAgent({ system: SYSTEM, serverTools: server, clientTools: client, callModel: m.call }, { messages: [openingMessage(seeds, '')], steps: 0, toolCalls: 0 })
    expect(out.pending).toBeUndefined()
    expect(out.trace.some(t => t.kind === 'error' && /refused/.test(t.text))).toBe(true)
    const fed = m.seen[1].at(-1)!.content as Block[]
    expect(fed[0]).toMatchObject({ type: 'tool_result', is_error: true, content: expect.stringContaining('made-up-999') })
  })

  it('feeds tool errors back to the model instead of crashing (privacy guard)', async () => {
    const m = scripted([turn(use('t1', 'qloo_recommend', { type: 'movie', seed_ids: ['Tolu Ade'] })), turn(say('ok'))])
    const { server, client } = tools()
    const out = await runAgent({ system: SYSTEM, serverTools: server, clientTools: client, callModel: m.call }, { messages: [openingMessage(seeds, '')], steps: 0, toolCalls: 0 })
    expect(out.done?.reason).toBe('finished')
    expect((m.seen[1].at(-1)!.content as Block[])[0]).toMatchObject({ is_error: true, content: expect.stringMatching(/entity id/) })
  })

  it('enforces step and tool budgets', async () => {
    const loop = () => turn(use(`t${Math.random()}`, 'qloo_search', { title: 'cars' }))
    const m = scripted(Array.from({ length: 10 }, loop))
    const { server, client } = tools()
    const out = await runAgent({ system: SYSTEM, serverTools: server, clientTools: client, callModel: m.call, maxSteps: 5, maxToolCalls: 3 }, { messages: [openingMessage(seeds, '')], steps: 0, toolCalls: 0 })
    expect(out.done?.reason).toBe('step_limit')
    expect(out.toolCalls).toBe(3)
    expect(out.trace.filter(t => t.text === 'Tool budget reached')).toHaveLength(2)
  })

  it('allows only one person-facing action per turn', async () => {
    const m = scripted([turn(
      use('a', 'ask_carer', { question: 'Loud ok?', options: ['yes', 'no'] }),
      use('b', 'ask_carer', { question: 'Again?', options: ['yes', 'no'] }),
    )])
    const { server, client } = tools()
    const out = await runAgent({ system: SYSTEM, serverTools: server, clientTools: client, callModel: m.call }, { messages: [openingMessage(seeds, '')], steps: 0, toolCalls: 0 })
    expect(out.pending?.id).toBe('a')
    expect(out.pending?.carry[0]).toMatchObject({ tool_use_id: 'b', is_error: true })
  })

  it('cards can only be seeds or successful qloo_recommend results: not search hits, errors or model text', () => {
    const ids = cardIds([
      openingMessage(seeds, ''),
      { role: 'assistant', content: [say('"id":"model-said"'), use('x', 'qloo_recommend', {}), use('y', 'qloo_recommend', {}), use('z', 'qloo_search', {})] },
      { role: 'user', content: [
        { type: 'tool_result', tool_use_id: 'x', content: '{"entities":[{"id":"q-1"}]}' },
        { type: 'tool_result', tool_use_id: 'y', content: '"id":"bad"', is_error: true },
        { type: 'tool_result', tool_use_id: 'z', content: '{"entities":[{"id":"crime-pod"}]}' },
      ] },
    ])
    expect([...ids].sort()).toEqual(['q-1', 'sample-0001'])
  })
  it('present_choice refuses an id the agent only found with qloo_search', () => {
    const present = tools().client.find(t => t.name === 'present_choice')!
    const messages: Msg[] = [
      openingMessage(seeds, ''),
      { role: 'assistant', content: [use('s', 'qloo_search', { title: 'crime' })] },
      { role: 'user', content: [{ type: 'tool_result', tool_use_id: 's', content: '{"entities":[{"id":"crime-pod"}]}' }] },
    ]
    expect(present.validate!({ items: [{ id: 'sample-0001', name: 'T' }, { id: 'crime-pod', name: 'C' }], why: 'x' }, messages)).toMatch(/crime-pod/)
  })
  it('qloo_recommend offers no podcasts', async () => {
    const rec = tools().server.find(t => t.name === 'qloo_recommend')!
    await expect(rec.run({ type: 'podcast', seed_ids: ['sample-0001'] })).rejects.toThrow(/type must be one of/)
  })
})

describe('agent endpoint', () => {
  it('503 without a model key; 400 without seeds', async () => {
    expect((await handleAgent('{}', {})).status).toBe(503)
    const m = scripted([])
    expect((await handleAgent(JSON.stringify({ start: { seeds: [] } }), {}, { callModel: m.call })).status).toBe(400)
  })
  it('round-trips start → pending → resume using sample Qloo when no Qloo key', async () => {
    const m = scripted([
      turn(use('t1', 'ask_carer', { question: 'Can he manage 3 cards?', options: ['2 cards', '3 cards'] })),
      turn(say('Thanks, starting with 2.')),
    ])
    const r1 = await (await handleAgent(JSON.stringify({ start: { seeds, notes: 'no loud audio' } }), {}, { callModel: m.call })).json()
    expect(r1.qlooMode).toBe('sample')
    expect(r1.pending.name).toBe('ask_carer')
    expect(r1.messages[0].content).toMatch(/no loud audio/)
    const r2 = await (await handleAgent(JSON.stringify({ state: r1, pending: r1.pending, result: { answer: '2 cards' } }), {}, { callModel: m.call })).json()
    expect(r2.done.reason).toBe('finished')
  })
  it('rejects oversized sessions', async () => {
    expect((await handleAgent('x'.repeat(400_001), { AWS_REGION: 'us-east-1' })).status).toBe(413)
  })
})
