import { bedrockCreate, DEFAULT_VISION_MODEL } from '../src/server/bedrock.js'
// Shared helpers for the measurement scripts. Calls go through the same
// allowlist as the app (proxyQloo), so the scripts can't send anything the app can't.
import { proxyQloo } from '../src/server/qlooProxy.js'
import { buildInsightsParams, buildSearchParams, type EntityType } from '../src/core/qlooRequest.js'
import { parseEntities } from '../src/qloo/parse.js'
import { norm } from '../src/eval/metrics.js'
import type { Entity } from '../src/qloo/client.js'

export function need(name: string): string {
  const v = process.env[name]
  if (!v) { console.error(`Set ${name} (see app/.env.example)`); process.exit(2) }
  return v
}

// Retries rate limits (429) with backoff, then throws: a failed call must never be scored as "not found".
async function qloo(op: string, p: URLSearchParams, key: string) {
  p.set('op', op)
  for (let attempt = 0; ; attempt++) {
    const res = await proxyQloo(new URL(`https://local/api/qloo?${p}`), key)
    const body = await res.json() as { error?: string }
    if (res.status === 429 && attempt < 4) { await new Promise(r => setTimeout(r, 1000 * 2 ** attempt)); continue }
    if (!res.ok) throw new Error(body.error)
    return body
  }
}

export async function search(title: string, key: string, type?: EntityType): Promise<Entity[]> {
  return parseEntities(await qloo('search', buildSearchParams(title, type), key), type ?? 'movie')
}

/** Best match: exact normalised name first, else first result. */
export async function resolve(title: string, key: string, type?: EntityType): Promise<Entity | undefined> {
  const r = await search(title, key, type)
  return r.find(e => norm(e.name) === norm(title)) ?? r[0]
}

export async function recommend(type: EntityType, seeds: string[], key: string, take = 10): Promise<Entity[]> {
  return parseEntities(await qloo('insights', buildInsightsParams({ type, seedEntityIds: seeds, contentRatings: ['G', 'PG', 'TV-Y', 'TV-Y7', 'TV-G'].filter(r => type === 'movie' ? !r.startsWith('TV') : r.startsWith('TV')), take }), key), type)
}

export async function claude(content: unknown[], model = process.env.BEDROCK_VISION_MODEL || DEFAULT_VISION_MODEL): Promise<string> {
  const out = await bedrockCreate(process.env)({ model, max_tokens: 1000, messages: [{ role: 'user', content }] })
  return out.content.filter((c: any) => c.type === 'text').map((c: any) => c.text).join('')
}

export const stamp = () => new Date().toISOString().slice(0, 19).replace(/:/g, '-')
