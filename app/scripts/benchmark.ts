// Usage: QLOO_API_KEY=… AWS_REGION=… (+ AWS credentials) npm run benchmark
// Same seed titles → (A) Qloo insights, (B) plain LLM suggestions. Every LLM title is
// checked against Qloo search; "unresolved" means Qloo can't find that title at all.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import type { EntityType } from '../src/core/qlooRequest.js'
import type { Entity } from '../src/qloo/client.js'
import { scoreProposals, type Proposal } from '../src/eval/metrics.js'
import { parseDetected } from '../src/server/vision.js'
import { need, resolve, recommend, claude, stamp } from './lib.js'

const qk = need('QLOO_API_KEY'); need('AWS_REGION')
const cases = JSON.parse(readFileSync('eval/seeds.json', 'utf8')) as { name: string; type: EntityType; seeds: string[] }[]
const results = []
for (const c of cases) {
  const seeds: Entity[] = []
  for (const s of c.seeds) { const e = await resolve(s, qk, c.type); if (e) seeds.push(e) }
  if (!seeds.length) { console.error(c.name, 'no seeds resolved'); continue }
  const seedTags = seeds.flatMap(s => s.tags)

  const q = await recommend(c.type, seeds.map(s => s.id), qk)
  const qloo: Proposal[] = q.map(e => ({ title: e.name, resolvedId: e.id, popularity: e.popularity, tags: e.tags }))

  const text = await claude([{ type: 'text', text: `Suggest 10 ${c.type.replace('_', ' ')} titles, age-appropriate for a child, similar to: ${c.seeds.join(', ')}. Exclude those. Reply JSON only: {"items":[{"title":string,"kind":"${c.type}"}]}` }])
  const llmTitles = parseDetected(text).map(i => i.title)
  // One at a time, and errors propagate: a rate-limited lookup must not count as "unresolved".
  const llm: Proposal[] = []
  for (const title of llmTitles) {
    const e = await resolve(title, qk, c.type)
    const exact = e && e.name.toLowerCase() === title.toLowerCase()
    llm.push(exact ? { title, resolvedId: e.id, popularity: e.popularity, tags: e.tags } : { title })
  }
  const row = { case: c.name, seeds: seeds.map(s => s.name), qloo: { score: scoreProposals(seedTags, qloo), items: qloo }, llm: { score: scoreProposals(seedTags, llm), items: llm } }
  results.push(row)
  console.log(c.name, '\n  Qloo', row.qloo.score, '\n  LLM ', row.llm.score)
}
mkdirSync('eval/results', { recursive: true })
const out = `eval/results/benchmark-${stamp()}.json`
writeFileSync(out, JSON.stringify(results, null, 2))
console.log('saved', out)
