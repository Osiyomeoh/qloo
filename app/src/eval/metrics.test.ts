import { describe, it, expect } from 'vitest'
import { norm, matchTitles, summarisePhotos, scoreProposals } from './metrics'

describe('eval metrics', () => {
  it('normalises titles', () => {
    expect(norm('The Polar Express!')).toBe('polar express')
    expect(norm('Thomas & Friends')).toBe('thomas and friends')
  })
  it('matches detected titles to labels with containment', () => {
    const r = matchTitles(['Thomas & Friends', 'Cars 2', 'Bluey'], ['Thomas and Friends', 'Cars 2: World Grand Prix', 'Peppa Pig'])
    expect(r).toMatchObject({ labels: 3, found: 2, missed: ['Bluey'], extra: ['Peppa Pig'] })
  })
  it('summarises recall, precision and resolution', () => {
    expect(summarisePhotos([{ labels: 4, found: 3, extra: ['x'], resolved: 3 }, { labels: 1, found: 1, extra: [], resolved: 0 }]))
      .toEqual({ photos: 2, labels: 5, found: 4, extra: 1, resolved: 3, recallPct: 80, precisionPct: 80, resolvedOfFoundPct: 75 })
  })
  it('scores proposal lists', () => {
    const s = scoreProposals(['trains', 'animation'], [
      { title: 'Chuggington', resolvedId: 'a', popularity: 0.6, tags: ['trains', 'animation', 'preschool', 'tv'] },
      { title: 'Made Up Show', },
      { title: 'Cars', resolvedId: 'b', popularity: 0.99, tags: ['vehicles', 'animation'] },
    ])
    expect(s).toEqual({ n: 3, unresolvedPct: 33, medianPopularity: 0.99, meanSeedTagOverlapPct: 50, distinct: 3 })
  })
  it('handles empty input', () => {
    expect(scoreProposals([], [])).toMatchObject({ n: 0, unresolvedPct: 0, medianPopularity: null })
  })
})
