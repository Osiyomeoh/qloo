import { describe, it, expect } from 'vitest'
import { suitableForChildren, recommendForKids, favouriteHits, KID_RATINGS } from './kids'
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

describe('favourite hits', () => {
  it('keeps only what a child can be shown, once per name, kind and year, at most 5', () => {
    // Shapes seen live 2026-10-28: "Ms Rachel" gave a supermarket, a pizzeria and a podcast; Peppa Pig came back as artist, brand and TV show.
    const h = (id: string, name: string, type: string): Entity => ({ id, name, type: type as EntityType, tags: [] })
    const hits = [h('a', 'Ms Rachel', 'place'), h('b', 'Ms Rachel', 'podcast'), h('c', 'Peppa Pig', 'brand'), h('d', 'Peppa Pig', 'tv_show'),
      h('e', 'Peppa Pig', 'artist'), h('f', 'peppa pig', 'tv_show'), h('g', 'Frozen', 'album'), h('i', 'Frozen', 'movie')]
    expect(favouriteHits(hits).map(x => x.id)).toEqual(['d', 'e', 'i'])
    expect(favouriteHits(['1', '2', '3', '4', '5', '6'].map(n => h(n, `Book ${n}`, 'book')))).toHaveLength(5)
    // "Frozen" live: the 2013 PG film and a 2010 R-rated one. Unrated stays.
    const frozen = [{ ...h('j', 'Frozen', 'movie'), year: 2013, rating: 'PG' }, { ...h('k', 'Frozen', 'movie'), year: 2010, rating: 'R' },
      { ...h('l', 'Halo', 'videogame'), rating: 'M' }, { ...h('m', 'Ms. Rachel', 'tv_show') }]
    expect(favouriteHits(frozen).map(x => x.id)).toEqual(['j', 'm'])
    expect(favouriteHits([{ ...h('n', 'The Lion King', 'movie'), year: 1994 }, { ...h('o', 'The Lion King', 'movie'), year: 2019 }])).toHaveLength(2)
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
