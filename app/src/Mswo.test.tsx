// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MswoAssessment } from './Mswo'
import { Trend } from './App'
import { loadHistory, saveSession, mswoSeries } from './core/history'

const items = [{ id: 'a', name: 'Alpha' }, { id: 'b', name: 'Bravo' }, { id: 'c', name: 'Charlie' }]

describe('MSWO assessment', () => {
  beforeEach(() => { localStorage.clear(); saveSession({ date: '2026-10-06', favourites: [], chosen: [], neverChosen: [] }) })
  afterEach(cleanup)
  it('runs 3 rounds without replacement, ranks, and saves to the latest session', async () => {
    const u = userEvent.setup()
    render(<MswoAssessment items={items} />)
    await u.click(screen.getByRole('button', { name: 'Start assessment' }))
    const pick = async (name: string) => u.click(within(screen.getByLabelText('Assessment')).getByRole('button', { name }))
    // round 1: Alpha, then Bravo; Charlie is alone and chosen last
    await pick('Alpha'); expect(screen.queryByRole('button', { name: 'Alpha' })).toBeNull()
    await pick('Bravo'); await pick('Charlie')
    // round 2: Alpha then no choice (ends the round); round 3: Alpha, Bravo, Charlie
    expect(screen.getByText(/Round 2 of 3/)).toBeTruthy()
    await pick('Alpha'); await u.click(screen.getByRole('button', { name: /No choice/ }))
    await pick('Alpha'); await pick('Bravo'); await pick('Charlie')
    const table = within(screen.getByLabelText('Preference hierarchy'))
    expect(table.getByText('3 of 3')).toBeTruthy() // Alpha
    const rows = table.getAllByRole('row').slice(1).map(r => r.textContent)
    expect(rows[0]).toMatch(/^1Alpha3 of 3.*100%/)
    expect(rows[1]).toMatch(/^2Bravo2 of 6.*33%/)
    expect(rows[2]).toMatch(/^3Charlie2 of 8.*25%/)
    expect(loadHistory()[0].mswo?.map(m => [m.name, m.pct])).toEqual([['Alpha', 100], ['Bravo', 33], ['Charlie', 25]])
  })
})

describe('trend across sessions', () => {
  afterEach(cleanup)
  it('lines up each item across assessed sessions, leaving gaps where it was not assessed', () => {
    const r = (date: string, mswo?: { id: string; name: string; pct: number; rank: number }[]) => ({ date, favourites: [], chosen: [], neverChosen: [], ...(mswo ? { mswo } : {}) })
    const h = [r('d1', [{ id: 'a', name: 'Alpha', pct: 50, rank: 2 }]), r('d2'), r('d3', [{ id: 'a', name: 'Alpha', pct: 100, rank: 1 }, { id: 'b', name: 'Bravo', pct: 33, rank: 2 }])]
    expect(mswoSeries(h)).toEqual({ dates: ['d1', 'd3'], items: [{ id: 'a', name: 'Alpha', pcts: [50, 100] }, { id: 'b', name: 'Bravo', pcts: [null, 33] }] })
    render(<Trend h={h} />)
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe('Alpha: 50% → 100%; Bravo: – → 33%')
    expect(screen.getByText(/Preference assessments over time \(2\)/)).toBeTruthy()
  })
})
