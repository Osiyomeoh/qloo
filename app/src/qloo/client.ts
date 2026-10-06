// Qloo access behind one interface. The fixture client returns clearly labelled
// sample data so the app and tests run without a key; the live client (planned)
// calls our server proxy, which holds the key.
import { buildInsightsParams, type EntityType } from '../core/qlooRequest'

export interface Entity { id: string; name: string; type: EntityType; tags: string[]; rating?: string }

export interface QlooClient {
  readonly mode: 'sample' | 'live'
  search(query: string): Promise<Entity[]>
  recommend(type: EntityType, seeds: string[], exclude: string[], ratings: string[]): Promise<Entity[]>
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
  async recommend(type: EntityType, seeds: string[], exclude: string[], ratings: string[]) {
    buildInsightsParams({ type, seedEntityIds: seeds, excludeEntityIds: exclude, contentRatings: ratings }) // same guard as live
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

export const KID_RATINGS = ['G', 'PG', 'TV-Y', 'TV-Y7', 'TV-G']
