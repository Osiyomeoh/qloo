// Qloo access behind one interface. The fixture client returns clearly labelled
// sample data so the app and tests run without a key; the live client
// calls our server proxy, which holds the key.
import { buildInsightsParams, buildSearchParams, type EntityType } from '../core/qlooRequest.js'
import { parseEntities } from './parse.js'

export interface Entity { id: string; name: string; type: EntityType; tags: string[]; rating?: string; year?: number; image?: string; popularity?: number }

export interface QlooClient {
  readonly mode: 'sample' | 'live'
  search(query: string): Promise<Entity[]>
  recommend(type: EntityType, seeds: string[], exclude: string[], ratings: string[], tags?: string[]): Promise<Entity[]>
}

const SAMPLE: Entity[] = [
  { id: 'sample-0001', name: 'Thomas & Friends', type: 'tv_show', tags: ['trains', 'animation', 'preschool'], rating: 'TV-Y' },
  { id: 'sample-0002', name: 'Cars', type: 'movie', tags: ['vehicles', 'animation', 'racing'], rating: 'G' },
  { id: 'sample-0003', name: 'Chuggington', type: 'tv_show', tags: ['trains', 'animation', 'preschool'], rating: 'TV-Y' },
  { id: 'sample-0004', name: 'Blaze and the Monster Machines', type: 'tv_show', tags: ['vehicles', 'animation', 'preschool'], rating: 'TV-Y' },
  { id: 'sample-0005', name: 'The Polar Express', type: 'movie', tags: ['trains', 'animation', 'holiday'], rating: 'G' },
  { id: 'sample-0006', name: 'Planes', type: 'movie', tags: ['vehicles', 'animation', 'flying'], rating: 'PG' },
  { id: 'sample-0007', name: 'Bluey', type: 'tv_show', tags: ['family', 'animation', 'preschool'], rating: 'TV-Y' },
  { id: 'sample-0008', name: 'Mad Max: Fury Road', type: 'movie', tags: ['vehicles', 'action'], rating: 'R' },
]

export class SampleClient implements QlooClient {
  readonly mode = 'sample' as const
  async search(query: string) {
    const q = query.trim().toLowerCase()
    return q ? SAMPLE.filter(e => e.name.toLowerCase().includes(q)) : []
  }
  async recommend(type: EntityType, seeds: string[], exclude: string[], ratings: string[], tags: string[] = []) {
    buildInsightsParams({ type, seedEntityIds: seeds, excludeEntityIds: exclude, contentRatings: ratings, tags }) // same guard as live
    const seedTags = new Set(SAMPLE.filter(e => seeds.includes(e.id)).flatMap(e => e.tags))
    return SAMPLE
      .filter(e => !seeds.includes(e.id) && !exclude.includes(e.id))
      .filter(e => !ratings.length || (e.rating && ratings.includes(e.rating)))
      .map(e => ({ e, overlap: e.tags.filter(t => seedTags.has(t)).length }))
      .filter(x => x.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap || a.e.name.localeCompare(b.e.name))
      .map(x => x.e)
  }
}

/** Calls our server proxy (/api/qloo); the key never reaches the browser. */
export class LiveClient implements QlooClient {
  readonly mode = 'live' as const
  private f: typeof fetch
  constructor(f: typeof fetch = (input, init) => fetch(input, init)) { this.f = f }
  private async get(p: URLSearchParams) {
    const res = await this.f(`/api/qloo?${p}`)
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error((body as { error?: string }).error ?? `request failed (${res.status})`)
    return body
  }
  async search(query: string) {
    const p = buildSearchParams(query); p.set('op', 'search')
    return parseEntities(await this.get(p), 'movie')
  }
  async recommend(type: EntityType, seeds: string[], exclude: string[], ratings: string[], tags: string[] = []) {
    const p = buildInsightsParams({ type, seedEntityIds: seeds, excludeEntityIds: exclude, contentRatings: ratings, tags })
    p.set('op', 'insights')
    return parseEntities(await this.get(p), type)
  }
}
