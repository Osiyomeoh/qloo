// Usage: QLOO_API_KEY=… npm run eval:filter
// How much of what Qloo returns for children's favourites is rated for older audiences, and how much of it
// Unspoken can show. "Can show" is recommendForKids, the same code behind the agent's qloo_recommend; the agent
// can only put seeds and those results on a card (cardIds in agent/unspoken.ts).
// The rule reads each item's own rating from Qloo. "older": rated for teens or adults (PG-13, R, NC-17, TV-14,
// TV-MA; ESRB T, M, AO; podcasts marked Explicit). "children": the set Unspoken allows (G, PG, TV-Y, TV-Y7, TV-G;
// E, E10+). "unclear": anything else, borderline (TV-PG, TV-Y7-FV, pre-1968 "Approved") or unrated, which Unspoken
// also leaves out. Unspoken offers no podcasts. Books and music carry no rating in Qloo's results, so aren't counted.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import type { EntityType } from '../src/core/qlooRequest.js'
import type { Entity } from '../src/qloo/client.js'
import { KID_RATINGS, KID_GAME_RATINGS, KID_TYPES, recommendForKids } from '../src/core/kids.js'
import { ServerQlooClient } from '../src/server/qlooServer.js'
import { need, resolve, stamp } from './lib.js'

type Verdict = 'children' | 'older' | 'unclear'
const OLDER = new Set(['PG-13', 'R', 'NC-17', 'TV-14', 'TV-MA', 'T', 'M', 'AO', 'Explicit'])
function verdict(e: Pick<Entity, 'type' | 'rating'>): Verdict {
  if (e.rating && OLDER.has(e.rating)) return 'older'
  if (e.rating && e.type !== 'podcast' && (e.type === 'videogame' ? KID_GAME_RATINGS : KID_RATINGS).includes(e.rating)) return 'children'
  return 'unclear'
}

const key = need('QLOO_API_KEY')
const qloo = new ServerQlooClient(key)
const TYPES: EntityType[] = ['movie', 'tv_show', 'videogame', 'podcast']
const cases = (JSON.parse(readFileSync('eval/seeds.json', 'utf8')) as { name: string; type: EntityType; seeds: string[] }[])
  .filter(c => !c.name.startsWith('older music'))

interface Row { name: string; rating: string | null; verdict: Verdict }
const row = (e: Entity): Row => ({ name: e.name, rating: e.rating ?? null, verdict: verdict(e) })
const results: { case: string; seeds: string[]; type: EntityType; unfiltered: Row[]; shown: Row[]; leftOutAfterQloo: number }[] = []
for (const c of cases) {
  const seeds: Entity[] = []
  for (const s of c.seeds) { const e = await resolve(s, key, c.type); if (e) seeds.push(e) }
  if (!seeds.length) { console.error(c.name, 'no seeds resolved'); continue }
  const ids = seeds.map(s => s.id)
  for (const type of TYPES) {
    const unfiltered = (await qloo.recommend(type, ids, [], [], [])).map(row)
    const kids = KID_TYPES.includes(type) ? await recommendForKids(qloo, type, ids, []) : { entities: [], leftOut: 0 }
    results.push({ case: c.name, seeds: seeds.map(s => s.name), type, unfiltered, shown: kids.entities.map(row), leftOutAfterQloo: kids.leftOut })
  }
}

const count = (rows: Row[], v: Verdict) => rows.filter(r => r.verdict === v).length
const sum = (pick: (r: (typeof results)[number]) => Row[], v: Verdict, types = TYPES) =>
  results.filter(r => types.includes(r.type)).reduce((n, r) => n + count(pick(r), v), 0)
const rated: EntityType[] = TYPES.filter(t => t !== 'podcast')
const summary = {
  cases: cases.length,
  unfiltered: {
    filmTvGames: results.filter(r => rated.includes(r.type)).reduce((n, r) => n + r.unfiltered.length, 0),
    older: sum(r => r.unfiltered, 'older', rated),
    unclear: sum(r => r.unfiltered, 'unclear', rated),
    podcasts: results.filter(r => r.type === 'podcast').reduce((n, r) => n + r.unfiltered.length, 0),
    podcastsExplicit: sum(r => r.unfiltered, 'older', ['podcast']),
  },
  shown: {
    total: results.reduce((n, r) => n + r.shown.length, 0),
    older: sum(r => r.shown, 'older'),
    unclear: sum(r => r.shown, 'unclear'),
    leftOutAfterQloo: results.reduce((n, r) => n + r.leftOutAfterQloo, 0),
  },
}
console.log(JSON.stringify(summary, null, 2))
mkdirSync('eval/results', { recursive: true })
const out = `eval/results/filter-${stamp()}.json`
writeFileSync(out, JSON.stringify({ rule: 'older = PG-13, R, NC-17, TV-14, TV-MA, T, M, AO, Explicit; children = G, PG, TV-Y, TV-Y7, TV-G, E, E10+; unclear = anything else or unrated', summary, results }, null, 2))
console.log('saved', out)
