import { describe, it, expect } from 'vitest'
import { buildInsightsParams, assertOnlyPublicSignals } from './qlooRequest'
import { pairedSchedule, nextMswoArray, score, guessAccuracy, nextSignals, type Trial } from './session'
import { buildProfile, sharedTags } from './profile'

const A = 'aaaaaaaa-1111', B = 'bbbbbbbb-2222'

describe('qloo request privacy guard', () => {
  it('builds only allowlisted public params', () => {
    const p = buildInsightsParams({ type: 'movie', seedEntityIds: [A], excludeEntityIds: [B], contentRatings: ['G', 'PG'] })
    expect([...p.keys()].sort()).toEqual(['filter.content_rating', 'filter.exclude.entities', 'filter.type', 'signal.interests.entities', 'take'])
    expect(p.get('filter.type')).toBe('urn:entity:movie')
  })
  it('rejects free text where an entity id is expected (e.g. a name)', () => {
    expect(() => buildInsightsParams({ type: 'movie', seedEntityIds: ['Tolu Ade'] })).toThrow(/entity id/)
  })
  it('rejects demographic or location params', () => {
    for (const k of ['signal.demographics.age', 'signal.location', 'filter.date_of_birth.min']) {
      expect(() => assertOnlyPublicSignals(new URLSearchParams({ [k]: 'x' }))).toThrow(/not allowed/)
    }
  })
  it('requires a seed and clamps take', () => {
    expect(() => buildInsightsParams({ type: 'book', seedEntityIds: [] })).toThrow()
    expect(buildInsightsParams({ type: 'book', seedEntityIds: [A], take: 999 }).get('take')).toBe('50')
  })
  it('rejects unknown ratings', () => {
    expect(() => buildInsightsParams({ type: 'movie', seedEntityIds: [A], contentRatings: ['X'] })).toThrow()
  })
})

describe('session engine', () => {
  it('paired schedule covers every pair once', () => {
    const s = pairedSchedule(['a', 'b', 'c', 'd'])
    expect(s).toHaveLength(6)
    expect(new Set(s.map(p => [...p].sort().join()))).toHaveProperty('size', 6)
  })
  it('MSWO removes chosen items and stops on no choice', () => {
    expect(nextMswoArray(['a', 'b', 'c'], [])).toEqual(['a', 'b', 'c'])
    expect(nextMswoArray(['a', 'b', 'c'], [{ shown: ['a', 'b', 'c'], chosen: 'b' }])).toEqual(['a', 'c'])
    expect(nextMswoArray(['a', 'b'], [{ shown: ['a', 'b'], chosen: null }])).toBeNull()
    expect(nextMswoArray(['a'], [{ shown: ['a'], chosen: 'a' }])).toBeNull()
  })
  const trials: Trial[] = [
    { shown: ['a', 'b'], chosen: 'a', carerGuess: 'b', engagementMs: 30000, reactions: ['smile', 'push-away'] },
    { shown: ['a', 'c'], chosen: 'c', carerGuess: 'c', engagementMs: 50000 },
    { shown: ['b', 'c'], chosen: 'c', carerGuess: 'c', engagementMs: 10000 },
  ]
  it('scores by selection % then engagement', () => {
    const s = score(trials)
    expect(s.map(x => x.id)).toEqual(['c', 'a', 'b'])
    expect(s[0]).toMatchObject({ chosen: 2, shown: 2, selectionPct: 100, engagementMs: 60000 })
    expect(s[1].positive).toBe(1)
  })
  it('measures carer guess accuracy', () => {
    expect(guessAccuracy(trials)).toEqual({ matched: 2, total: 3 })
  })
  it('learns: chosen become signals, repeatedly ignored excluded', () => {
    expect(nextSignals(trials)).toEqual({ signal: ['c', 'a'], exclude: ['b'] })
  })
})

describe('profile', () => {
  it('labels every line by source and keeps Qloo lines about items', () => {
    const lines = buildProfile(
      [{ id: 'c', title: 'Thomas & Friends', source: 'qloo' }],
      [{ shown: ['c', 'd'], chosen: 'c', engagementMs: 42000 }],
      { c: ['trains', 'animation'], d: ['trains'] },
      ['Dislikes loud audio'],
    )
    expect(lines).toEqual([
      { source: 'choice', text: 'Chose Thomas & Friends 1 of 1 times (42s engaged)' },
      { source: 'qloo', text: 'These items have in common: trains' },
      { source: 'carer', text: 'Dislikes loud audio' },
    ])
    expect(lines.filter(l => l.source === 'qloo').every(l => !/\b(he|she|they|likes)\b/i.test(l.text))).toBe(true)
  })
  it('shared tags need at least two items', () => {
    expect(sharedTags({ x: ['a', 'b'], y: ['b'], z: ['b', 'a'] })).toEqual(['b', 'a'])
  })
})
