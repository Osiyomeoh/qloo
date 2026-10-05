// Builds Qloo Insights requests. Only public cultural signals may leave the app
// (kit docs/SAFE_USE.md): entity IDs, tags, entity type and rating filters.

export type EntityType =
  | 'artist' | 'book' | 'brand' | 'movie' | 'person' | 'place'
  | 'podcast' | 'tv_show' | 'video_game'

export interface InsightsInput {
  type: EntityType
  seedEntityIds: string[]
  excludeEntityIds?: string[]
  contentRatings?: string[]
  take?: number
}

const ALLOWED_PARAMS = new Set([
  'filter.type',
  'signal.interests.entities',
  'filter.exclude.entities',
  'filter.content_rating',
  'take',
])

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
  const p = new URLSearchParams()
  p.set('filter.type', `urn:entity:${input.type}`)
  p.set('signal.interests.entities', input.seedEntityIds.join(','))
  if (input.excludeEntityIds?.length) p.set('filter.exclude.entities', input.excludeEntityIds.join(','))
  if (input.contentRatings?.length) p.set('filter.content_rating', input.contentRatings.join(','))
  p.set('take', String(Math.min(Math.max(input.take ?? 10, 1), 50)))
  assertOnlyPublicSignals(p)
  return p
}

/** Throws if any parameter outside the allowlist is present. Used by the server proxy too. */
export function assertOnlyPublicSignals(p: URLSearchParams): void {
  for (const key of p.keys()) {
    if (!ALLOWED_PARAMS.has(key)) throw new Error(`parameter not allowed to leave the app: ${key}`)
  }
}
