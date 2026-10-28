// Parses Qloo /search and /v2/insights responses into our Entity shape.
// Mirrors the official harness (results array, or results.entities; entity_id or id).
// Tag shape is confirmed against live responses once the key arrives (PLAN day-1 checks).
import type { EntityType } from '../core/qlooRequest.js'
import type { Entity } from './client.js'

type Rec = Record<string, unknown>
const rec = (v: unknown): Rec | undefined => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Rec) : undefined)

export function parseEntities(body: unknown, fallbackType: EntityType): Entity[] {
  const b = rec(body) ?? {}
  const raw = Array.isArray(b.results) ? b.results : rec(b.results)?.entities ?? []
  if (!Array.isArray(raw)) return []
  const out: Entity[] = []
  for (const v of raw) {
    const r = rec(v)
    if (!r) continue
    const id = r.entity_id ?? r.id
    if (typeof id !== 'string' || typeof r.name !== 'string' || !id || !r.name) continue
    const tags = Array.isArray(r.tags)
      ? r.tags.map(t => (typeof t === 'string' ? t : rec(t)?.name)).filter((t): t is string => typeof t === 'string')
      : []
    const types = Array.isArray(r.types) ? r.types : [r.type]
    const urn = types.find((t): t is string => typeof t === 'string' && t.startsWith('urn:entity:'))
    const props = rec(r.properties)
    const rating = props?.content_rating
    const img = rec(props?.image)?.url
    const year = props?.release_year
    out.push({
      id, name: r.name, tags,
      type: (urn?.slice('urn:entity:'.length) as EntityType) ?? fallbackType,
      ...(typeof rating === 'string' ? { rating } : {}),
      ...(typeof img === 'string' ? { image: img } : {}),
      ...(typeof year === 'number' ? { year } : {}),
      ...(typeof r.popularity === 'number' ? { popularity: r.popularity } : {}),
    })
  }
  return out
}
