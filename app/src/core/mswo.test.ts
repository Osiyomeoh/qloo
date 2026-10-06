import { describe, expect, it } from 'vitest'
import { nextArray, rankMswo, roundStart, type MswoTrial } from './mswo'

const run = (items: string[], pickOrder: (string | null)[][], rounds = 3) => {
  const trials: MswoTrial[] = []
  for (const picks of pickOrder) for (const p of picks) {
    const n = nextArray(items, trials, rounds)!
    trials.push({ ...n, chosen: p === '*' ? n.array[0] : p })
  }
  return trials
}

describe('MSWO', () => {
  it('removes the chosen item and rotates the rest', () => {
    const t: MswoTrial[] = [{ round: 0, array: ['a', 'b', 'c', 'd'], chosen: 'b' }]
    expect(nextArray(['a', 'b', 'c', 'd'], t)).toEqual({ round: 0, array: ['c', 'd', 'a'] })
  })
  it('starts each round rotated and stops after the last round', () => {
    expect(roundStart(['a', 'b', 'c'], 1)).toEqual(['b', 'c', 'a'])
    const t = run(['a', 'b'], [['a', 'b'], ['a', 'b']], 2)
    expect(t.map(x => x.round)).toEqual([0, 0, 1, 1])
    expect(nextArray(['a', 'b'], t, 2)).toBeNull()
  })
  it('a no-choice ends the round; the rest count as available, not chosen', () => {
    const t = run(['a', 'b', 'c'], [['a', null], ['a', 'b', 'c']], 2)
    expect(t[1]).toMatchObject({ round: 0, chosen: null })
    expect(t[2].round).toBe(1)
    const r = rankMswo(t)
    expect(r[0]).toMatchObject({ id: 'a', chosen: 2, available: 2, pct: 100, rank: 1 })
    expect(r.find(x => x.id === 'b')).toMatchObject({ chosen: 1, available: 4, pct: 25 })
  })
  it('scores the textbook case: always first = 100%, always last = 33% over 3 rounds of 3', () => {
    const r = rankMswo(run(['a', 'b', 'c'], [['a', 'b', 'c'], ['a', 'b', 'c'], ['a', 'b', 'c']]))
    expect(r.map(x => [x.id, x.chosen, x.available, x.pct, x.rank])).toEqual([['a', 3, 3, 100, 1], ['b', 3, 6, 50, 2], ['c', 3, 9, 33, 3]])
  })
})
