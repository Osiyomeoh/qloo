import { describe, it, expect } from 'vitest'
import { suitableForChildren, recommendForKids, KID_RATINGS } from './kids'
import type { Entity, QlooClient } from '../qloo/client'
import type { EntityType } from './qlooRequest'

const e = (type: EntityType, rating?: string): Entity => ({ id: `x-${type}-${rating}`, name: 'x', type, tags: [], ...(rating !== undefined ? { rating } : {}) })

describe('suitable for children', () => {
  it('film and TV by content rating; unrated is left out', () => {
    expect(suitableForChildren(e('tv_show', 'TV-Y'))).toBe(true)
    expect(suitableForChildren(e('movie', 'PG'))).toBe(true)
    expect(suitableForChildren(e('movie', 'R'))).toBe(false)
    expect(suitableForChildren(e('movie', 'Not Rated'))).toBe(false)
    expect(suitableForChildren(e('movie'))).toBe(false)
  })
  it('games by ESRB rating: E and E10+ only; unrated is left out', () => {
    expect(suitableForChildren(e('videogame', 'E'))).toBe(true)
    expect(suitableForChildren(e('videogame', 'E10+'))).toBe(true)
    expect(suitableForChildren(e('videogame', 'M'))).toBe(false)
    expect(suitableForChildren(e('videogame', ''))).toBe(false)
  })
  it('books and music pass (filtered by tag at Qloo); podcasts never do', () => {
    expect(suitableForChildren(e('book'))).toBe(true)
    expect(suitableForChildren(e('artist'))).toBe(true)
    expect(suitableForChildren(e('podcast', 'Clean'))).toBe(false)
  })
})

describe('recommend for kids', () => {
  function fake(out: Entity[]) {
    const calls: unknown[][] = []
    const qloo: QlooClient = { mode: 'live', search: async () => [], recommend: async (...a) => { calls.push(a); return out } }
    return { qloo, calls }
  }
  it('asks Qloo for kids ratings on film and TV, children\'s tags on books and music, neither on games', async () => {
    const { qloo, calls } = fake([])
    for (const t of ['movie', 'tv_show', 'book', 'artist', 'videogame'] as EntityType[]) await recommendForKids(qloo, t, ['aaaaaaaa-1'], [])
    expect(calls.map(c => [c[0], c[3], c[4]])).toEqual([
      ['movie', KID_RATINGS, []],
      ['tv_show', KID_RATINGS, []],
      ['book', [], ['urn:tag:genre:media:childrens']],
      ['artist', [], ['urn:tag:genre:music:children']],
      ['videogame', [], []],
    ])
  })
  it('drops what fails the check and says how many', async () => {
    const { qloo } = fake([e('videogame', 'E'), e('videogame', 'M'), e('videogame', '')])
    const r = await recommendForKids(qloo, 'videogame', ['aaaaaaaa-1'], [])
    expect(r.entities.map(x => x.rating)).toEqual(['E'])
    expect(r.leftOut).toBe(2)
  })
  it('refuses podcasts before calling Qloo', async () => {
    const { qloo, calls } = fake([])
    await expect(recommendForKids(qloo, 'podcast', ['aaaaaaaa-1'], [])).rejects.toThrow(/type must be one of/)
    expect(calls).toHaveLength(0)
  })
})
