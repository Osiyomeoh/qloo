// Usage: QLOO_API_KEY=… ANTHROPIC_API_KEY=… npm run benchmark
// Same seed titles → (A) Qloo insights, (B) plain LLM suggestions. Every LLM title is
// checked against Qloo search; "unresolved" means Qloo can't find that title at all.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import type { EntityType } from '../src/core/qlooRequest.js'
import { scoreProposals, type Proposal } from '../src/eval/metrics.js'
import { parseDetected } from '../src/server/vision.js'
import { need, resolve, recommend, claude, stamp } from './lib.js'

const qk = need('QLOO_API_KEY'), ak = need('ANTHROPIC_API_KEY')
const cases = JSON.parse(readFileSync('eval/seeds.json', 'utf8')) as { name: string; type: EntityType; seeds: string[] }[]
const results = []
for (const c of cases) {
  const seeds = (await Promise.all(c.seeds.map(s => resolve(s, qk, c.type)))).filter(e => !!e)
  if (!seeds.length) { console.error(c.name, 'no seeds resolved'); continue }
  const seedTags = seeds.flatMap(s => s.tags)

  const q = await recommend(c.type, seeds.map(s => s.id), qk)
  const qloo: Proposal[] = q.map(e => ({ title: e.name, resolvedId: e.id, popularity: e.popularity, tags: e.tags }))

  const text = await claude([{ type: 'text', text: `Suggest 10 ${c.type.replace('_', ' ')} titles, age-appropriate for a child, similar to: ${c.seeds.join(', ')}. Exclude those. Reply JSON only: {"items":[{"title":string,"kind":"${c.type}"}]}` }], ak)
  const llmTitles = parseDetected(text).map(i => i.title)
  const llm: Proposal[] = await Promise.all(llmTitles.map(async title => {
    const e = await resolve(title, qk, c.type).catch(() => undefined)
    const exact = e && e.name.toLowerCase() === title.toLowerCase()
    return exact ? { title, resolvedId: e.id, popularity: e.popularity, tags: e.tags } : { title }
  }))
  const row = { case: c.name, seeds: seeds.map(s => s.name), qloo: { score: scoreProposals(seedTags, qloo), items: qloo }, llm: { score: scoreProposals(seedTags, llm), items: llm } }
  results.push(row)
  console.log(c.name, '\n  Qloo', row.qloo.score, '\n  LLM ', row.llm.score)
}
mkdirSync('eval/results', { recursive: true })
const out = `eval/results/benchmark-${stamp()}.json`
writeFileSync(out, JSON.stringify(results, null, 2))
console.log('saved', out)
