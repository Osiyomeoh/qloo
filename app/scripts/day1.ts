// Day-1 checks against live Qloo, through proxyQloo (same allowlist as the app).
// Usage: npx tsx --env-file=../.env scripts/day1.ts. Prints compact summaries only.
import { proxyQloo } from '../src/server/qlooProxy.js'
const key = process.env.QLOO_API_KEY
async function call(op: string, params: Record<string, string>) {
  const res = await proxyQloo(new URL(`https://local/api/qloo?${new URLSearchParams({ op, ...params })}`), key)
  return { status: res.status, body: await res.json() as any }
}
const list = (b: any): any[] => Array.isArray(b?.results) ? b.results : (b?.results?.entities ?? [])
const tagNames = (e: any) => (e.tags ?? []).map((t: any) => t.name ?? t.id)

const titles: [string, string][] = [
  ['Bluey', 'tv_show'], ['Peppa Pig', 'tv_show'], ['Paw Patrol', 'tv_show'], ['Cocomelon', 'tv_show'], ['Thomas & Friends', 'tv_show'],
  ['Frozen', 'movie'], ['Cars', 'movie'], ['Moana', 'movie'], ['My Neighbor Totoro', 'movie'], ['The Lion King', 'movie'],
  ['ABBA', 'artist'], ['Vera Lynn', 'artist'], ['Nat King Cole', 'artist'], ['Fela Kuti', 'artist'], ['Frank Sinatra', 'artist'],
  ['bluey season 2', 'tv_show'], ['peppa', 'tv_show'], ['thomas the tank engine', 'tv_show'], ['frozen 2 elsa', 'movie'], ['paw patrol the movie', 'movie'],
]
console.log('## 1-3 search hit, tags, images')
const ids: Record<string, string> = {}
for (const [q, t] of titles) {
  const r = await call('search', { query: q, types: `urn:entity:${t}`, take: '3' })
  const top = list(r.body)[0]
  if (top && !ids[t]) ids[t] = top.entity_id
  console.log(`${r.status} "${q}" → ${top ? `${top.name} [${top.types}] tags=${(top.tags ?? []).length} img=${!!top.properties?.image?.url} pop=${top.popularity ?? '-'}` : 'NO HIT'}`)
}
console.log('\n## 4-5 insights shape + exclusion + rating')
for (const t of ['tv_show', 'movie', 'artist']) {
  const p: Record<string, string> = { 'filter.type': `urn:entity:${t}`, 'signal.interests.entities': ids[t], 'filter.exclude.entities': ids[t], take: '5' }
  if (t === 'movie') p['filter.content_rating'] = 'G,PG'
  const r = await call('insights', p)
  const es = list(r.body)
  console.log(`${t} ${r.status} n=${es.length} topKeys=${Object.keys(r.body ?? {})} resultsKeys=${Array.isArray(r.body?.results) ? 'array' : Object.keys(r.body?.results ?? {})} seedExcluded=${!es.some(e => e.entity_id === ids[t])}`)
  if (!es.length) console.log('  body:', JSON.stringify(r.body).slice(0, 300))
  for (const e of es.slice(0, 5)) console.log(`  ${e.name} | aff=${e.query?.affinity ?? '-'} pop=${e.popularity ?? '-'} rating=${e.properties?.content_rating ?? '-'} img=${!!e.properties?.image?.url} tags=${tagNames(e).slice(0, 5).join(', ')}`)
  if (es[0]) console.log('  entity keys:', Object.keys(es[0]).join(','), '| tag sample:', JSON.stringify((es[0].tags ?? [])[0]))
}
