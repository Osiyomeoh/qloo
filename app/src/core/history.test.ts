// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { loadHistory, saveSession, forgetHistory, knownFavourites, historyBrief } from './history'

const rec = (date: string, fav: string[], never: string[] = []) => ({ date, favourites: fav.map(id => ({ id, name: id.toUpperCase() })), chosen: [], neverChosen: never.map(id => ({ id, name: id.toUpperCase() })) })

describe('history', () => {
  beforeEach(() => localStorage.clear())
  it('saves, loads and forgets', () => {
    saveSession(rec('2026-10-01', ['a']))
    expect(loadHistory()).toHaveLength(1)
    forgetHistory()
    expect(loadHistory()).toEqual([])
  })
  it('keeps the last 20 sessions', () => {
    for (let i = 0; i < 25; i++) saveSession(rec(`d${i}`, []))
    const h = loadHistory()
    expect(h).toHaveLength(20)
    expect(h[0].date).toBe('d5')
  })
  it('survives corrupt storage', () => {
    localStorage.setItem('unspoken.history.v1', '{not json')
    expect(loadHistory()).toEqual([])
  })
  it('lists favourites newest first without repeats', () => {
    expect(knownFavourites([rec('1', ['a', 'b']), rec('2', ['c', 'a'])]).map(f => f.id)).toEqual(['c', 'a', 'b'])
  })
  it('brief is empty with no sessions and names favourites otherwise', () => {
    expect(historyBrief({ sessions: 0, favourites: [], neverChosen: [] })).toBe('')
    const b = historyBrief({ sessions: 2, favourites: ['Moana'], neverChosen: ['Cars'] })
    expect(b).toContain('Moana'); expect(b).toContain('never chosen: Cars')
  })
})
