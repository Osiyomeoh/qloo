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

async function qloo(op: string, p: URLSearchParams, key: string) {
  p.set('op', op)
  const res = await proxyQloo(new URL(`https://local/api/qloo?${p}`), key)
  const body = await res.json() as { error?: string }
  if (!res.ok) throw new Error(body.error)
  return body
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

export async function claude(content: unknown[], key: string, model = 'claude-sonnet-5-5'): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model, max_tokens: 1000, messages: [{ role: 'user', content }] }),
  })
  if (!res.ok) throw new Error(`model error ${res.status}`)
  const out = await res.json() as { content: { type: string; text?: string }[] }
  return out.content.filter(c => c.type === 'text').map(c => c.text).join('')
}

export const stamp = () => new Date().toISOString().slice(0, 19).replace(/:/g, '-')
