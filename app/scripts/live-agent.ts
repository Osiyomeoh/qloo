// Runs the Unspoken agent end to end on the real model (Claude via Bedrock) and live Qloo,
// with a simulated person whose hidden preference is a tag pattern. It picks the card whose
// Qloo tags match most (else the first card, briefly). ask_carer gets the first option.
// This tests the loop and the agent's adaptation; it is not evidence about real people.
// Usage: AWS_PROFILE=… AWS_REGION=… npx tsx --env-file=<path to .env> scripts/live-agent.ts
import { handleAgent } from '../src/server/agentHandler.js'
import { ServerQlooClient } from '../src/server/qlooServer.js'

const SEEDS = ['Thomas & Friends']
const LOVES = /train|vehicle|car|truck|machine|transport|engine|race/i
const env = process.env as Record<string, string>
const qloo = new ServerQlooClient(env.QLOO_API_KEY)
const seeds = []
for (const t of SEEDS) { const e = (await qloo.search(t))[0]; if (e) seeds.push({ id: e.id, name: e.name }) }
console.log('seeds:', seeds.map(s => s.name).join(', '))

const tags = new Map<string, string[]>(), names = new Map<string, string>()
let body: unknown = { start: { seeds, notes: 'Age 6, minimally verbal, can handle 2 cards at a time.' } }
let hits = 0, trials = 0
for (let turn = 0; turn < 14; turn++) {
  const t0 = Date.now()
  const res = await handleAgent(JSON.stringify(body), env)
  const out = (await res.json()) as any
  if (!res.ok) { console.log('ERROR', res.status, out.error); break }
  for (const t of out.trace) {
    for (const e of t.data?.entities ?? []) { tags.set(e.id, e.tags ?? []); names.set(e.id, e.name) }
    if (t.kind !== 'result') console.log(`  [${t.kind}] ${t.kind === 'ask' ? t.text : t.text.slice(0, 220)}`)
  }
  console.log(`  (${((Date.now() - t0) / 1000).toFixed(1)}s)`)
  if (out.done) { console.log('DONE', out.done.reason, out.done.text.slice(0, 300)); break }
  const p = out.pending
  let result: unknown
  if (p.name === 'present_choice') {
    const items = p.input.items as { id: string; name: string }[]
    const score = (id: string) => (tags.get(id) ?? []).filter(t => LOVES.test(t)).length
    const best = [...items].sort((a, b) => score(b.id) - score(a.id))[0]
    const liked = score(best.id) > 0
    trials++; if (liked) hits++
    console.log(`  CARDS: ${items.map(i => `${i.name}[${score(i.id)}]`).join(' vs ')} → picks ${best.name}${liked ? '' : ' (briefly)'}`)
    console.log(`  WHY: ${p.input.why}`)
    result = { chosen_id: best.id, carer_guess_id: items[0].id, engagement_seconds: liked ? 40 : 5, reactions: liked ? ['smiled', 'reached'] : ['looked away'] }
  } else if (p.name === 'ask_carer') {
    console.log(`  ASK: ${p.input.question} → ${p.input.options[0]}`)
    result = { answer: p.input.options[0] }
  } else if (p.name === 'finish') {
    console.log(`\nSUMMARY: ${p.input.summary}\nNEW FAVOURITES: ${(p.input.new_favourite_ids as string[]).map(id => names.get(id) ?? id).join(', ')}\nNEXT TIME: ${p.input.next_time ?? ''}`)
    break
  }
  body = { state: { messages: out.messages, steps: out.steps, toolCalls: out.toolCalls }, pending: p, result }
}
console.log(`\ntrials ${trials}, cards matching the hidden preference chosen in ${hits}`)
