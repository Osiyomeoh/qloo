import { describe, expect, it } from 'vitest'
import { buildWorld, statusOf } from './world'

const seed = { id: 's', name: 'Bluey', tags: ['Family', 'Preschool'] }
const a = { id: 'a', name: 'Peppa Pig', tags: ['Preschool', 'Short'] }
const b = { id: 'b', name: 'Kipper', tags: ['Christmas'] }
const c = { id: 'c', name: 'Pocoyo', tags: [] }

describe('statusOf', () => {
  it('needs two choices on at least half the showings for "again"', () => {
    expect(statusOf(2, 3)).toBe('again')
    expect(statusOf(2, 5)).toBe('once')
    expect(statusOf(1, 1)).toBe('once')
    expect(statusOf(0, 3)).toBe('not-yet')
    expect(statusOf(0, 0)).toBe('unseen')
  })
})

describe('buildWorld', () => {
  const trials = [
    { shown: ['s', 'a'], chosen: 'a' },
    { shown: ['a', 'b'], chosen: 'a', reactions: ['distress' as const] },
    { shown: ['s', 'b'], chosen: 's' },
  ]
  const w = buildWorld([seed], [a, b, c], trials, [{ date: '2026-10-01', favourites: [], chosen: [{ id: 'a', name: 'Peppa Pig' }], neverChosen: [] }])
  const by = Object.fromEntries(w.map(n => [n.id, n]))

  it('takes status only from choices', () => {
    expect(by.a.status).toBe('again')
    expect(by.s.status).toBe('once')
    expect(by.b.status).toBe('not-yet')
    expect(by.c.status).toBe('unseen')
  })
  it('links an item by a Qloo tag it shares with the favourites, and only then', () => {
    expect(by.a.link).toBe('Preschool')
    expect(by.b.link).toBeUndefined()
    expect(by.s.link).toBeUndefined()
  })
  it('counts earlier sessions and flags an upset choice', () => {
    expect(by.a.sessions).toBe(1)
    expect(by.a.upset).toBe(true)
    expect(by.s.upset).toBe(false)
  })
})
