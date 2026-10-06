// Builds Qloo Insights requests. Only public cultural signals may leave the app
// (kit docs/SAFE_USE.md): entity IDs, tags, entity type and rating filters.

export type EntityType =
  | 'artist' | 'book' | 'brand' | 'movie' | 'person' | 'place'
  | 'podcast' | 'tv_show' | 'videogame'

export interface InsightsInput {
  type: EntityType
  seedEntityIds: string[]
  excludeEntityIds?: string[]
  contentRatings?: string[]
  /** Qloo tag ids, e.g. urn:tag:genre:music:children */
  tags?: string[]
  take?: number
}

const ALLOWED_PARAMS = new Set([
  'filter.type',
  'signal.interests.entities',
  'filter.exclude.entities',
  'filter.content_rating',
  'filter.tags',
  'take',
])
const TYPES = new Set<string>(['artist', 'book', 'brand', 'movie', 'person', 'place', 'podcast', 'tv_show', 'videogame'])
const TAG_ID = /^urn:tag:[a-z0-9_]+(:[a-z0-9_]+)+$/

const ENTITY_ID = /^[A-Za-z0-9-]{8,64}$/
const RATINGS = new Set(['G', 'PG', 'PG-13', 'R', 'NC-17', 'TV-Y', 'TV-Y7', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA'])

export function buildInsightsParams(input: InsightsInput): URLSearchParams {
  if (input.seedEntityIds.length === 0) throw new Error('at least one seed entity is required')
  for (const id of [...input.seedEntityIds, ...(input.excludeEntityIds ?? [])]) {
    if (!ENTITY_ID.test(id)) throw new Error(`not a Qloo entity id: ${id}`)
  }
  for (const r of input.contentRatings ?? []) {
    if (!RATINGS.has(r)) throw new Error(`unknown content rating: ${r}`)
  }
  for (const t of input.tags ?? []) {
    if (!TAG_ID.test(t)) throw new Error(`not a Qloo tag id: ${t}`)
  }
  const p = new URLSearchParams()
  p.set('filter.type', `urn:entity:${input.type}`)
  p.set('signal.interests.entities', input.seedEntityIds.join(','))
  if (input.excludeEntityIds?.length) p.set('filter.exclude.entities', input.excludeEntityIds.join(','))
  if (input.contentRatings?.length) p.set('filter.content_rating', input.contentRatings.join(','))
  if (input.tags?.length) p.set('filter.tags', input.tags.join(','))
  p.set('take', String(Math.min(Math.max(input.take ?? 10, 1), 50)))
  assertOnlyPublicSignals(p)
  return p
}

/** Throws if any parameter outside the allowlist is present, or a value is not the expected
 * id, type, rating or tag (so free text can't ride in an allowed param). Used by the server proxy too. */
export function assertOnlyPublicSignals(p: URLSearchParams): void {
  for (const [key, value] of p) {
    if (!ALLOWED_PARAMS.has(key)) throw new Error(`parameter not allowed to leave the app: ${key}`)
    const parts = value.split(',')
    const ok =
      key === 'filter.type' ? value.startsWith('urn:entity:') && TYPES.has(value.slice('urn:entity:'.length))
      : key === 'filter.content_rating' ? parts.every(r => RATINGS.has(r))
      : key === 'filter.tags' ? parts.every(t => TAG_ID.test(t))
      : key === 'take' ? /^\d{1,2}$/.test(value)
      : parts.every(id => ENTITY_ID.test(id))
    if (!ok) throw new Error(`value not allowed to leave the app for ${key}`)
  }
}

const SEARCH_PARAMS = new Set(['query', 'types', 'take'])

/** Search sends only a title the carer typed or confirmed, capped in length. */
export function buildSearchParams(query: string, type?: EntityType): URLSearchParams {
  const q = query.trim()
  if (!q || q.length > 120) throw new Error('search query must be 1-120 characters')
  const p = new URLSearchParams({ query: q, take: '5' })
  if (type) p.set('types', `urn:entity:${type}`)
  return p
}

export function assertSearchParams(p: URLSearchParams): void {
  for (const key of p.keys()) if (!SEARCH_PARAMS.has(key)) throw new Error(`parameter not allowed to leave the app: ${key}`)
  const q = p.get('query') ?? ''
  if (!q.trim() || q.length > 120) throw new Error('search query must be 1-120 characters')
}
