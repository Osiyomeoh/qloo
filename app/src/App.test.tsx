// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import type { Entity, QlooClient } from './qloo/client'
import { EVIDENCE } from './evidence'

describe('full flow on sample data', () => {
  it('seed → suggestions → 6 paired choices → labelled profile', async () => {
    const u = userEvent.setup()
    render(<App />)
    expect(screen.getByRole('status').textContent).toMatch(/Sample data/)

    await u.type(screen.getByLabelText('Title'), 'thomas')
    await u.click(screen.getByRole('button', { name: 'Find' }))
    await u.click(await screen.findByRole('button', { name: /^\+ Thomas & Friends/ }))
    await u.click(screen.getByRole('button', { name: 'Manual: show things to try' }))

    expect(await screen.findByText('Things to try')).toBeTruthy()
    expect(screen.queryByText(/Mad Max/)).toBeNull() // R-rated filtered out
    await u.click(screen.getByRole('button', { name: 'Start a choice session' }))

    // 4 items → 6 pairs. Carer always guesses the left card; child always picks the right one.
    for (let n = 1; n <= 6; n++) {
      expect(screen.getByText(`Choice ${n} of 6`)).toBeTruthy()
      const [left, right] = document.querySelectorAll<HTMLButtonElement>('.card')
      await u.click(left)
      await u.click(right)
      await u.click(screen.getByRole('button', { name: 'smile' }))
      await u.click(screen.getByRole('button', { name: /finished/ }))
    }

    expect(screen.getByText('One-page profile')).toBeTruthy()
    expect(screen.getByText(/Carer guessed right 0 of 6 times/)).toBeTruthy()
    expect(screen.getAllByText('Shown by choice').length).toBeGreaterThan(0)
  })

  it('a judge link starts with a favourite already added', async () => {
    cleanup()
    window.history.pushState({}, '', '/?demo=thomas')
    try {
      render(<App />)
      expect((await screen.findByText(/Favourites: Thomas & Friends/)).textContent).toBe('Favourites: Thomas & Friends')
      expect(screen.getByText(/is in as their favourite/)).toBeTruthy()
      expect((screen.getByRole('button', { name: 'Let the agent run a session' }) as HTMLButtonElement).disabled).toBe(false)
    } finally { window.history.pushState({}, '', '/') }
  })

  it('the start screen gives each design choice its public source', () => {
    cleanup()
    render(<App />)
    const items = within(screen.getByRole('region', { name: 'Why it works this way' })).getAllByRole('listitem')
    expect(items).toHaveLength(Object.keys(EVIDENCE).length)
    for (const li of items) {
      expect(within(li).getByRole('link').getAttribute('href')).toMatch(/^https:\/\/(doi\.org|www\.who\.int)\//)
      expect(li.querySelector('.so')?.textContent).toMatch(/^So /)
    }
  })

  it('search shows only what a child can be shown, says what kind each is, and says when nothing was found', async () => {
    cleanup()
    const results: Record<string, Entity[]> = {
      'peppa pig': [
        { id: 'aaaaaaaa-1', name: 'Peppa Pig', type: 'brand', tags: [] },
        { id: 'aaaaaaaa-2', name: 'Peppa Pig', type: 'tv_show', tags: [], rating: 'TV-Y', year: 2004 },
        { id: 'aaaaaaaa-3', name: 'Peppa Pig', type: 'place', tags: [] },
      ],
      'ms rachel': [{ id: 'aaaaaaaa-4', name: 'Ms Rachel', type: 'place', tags: [] }],
    }
    const client: QlooClient = {
      mode: 'live',
      search: async q => { if (q === 'offline') throw new Error('Failed to fetch'); return results[q] ?? [] },
      recommend: async () => [],
    }
    const u = userEvent.setup()
    render(<App client={client} />)
    await u.type(screen.getByLabelText('Title'), 'peppa pig')
    await u.click(screen.getByRole('button', { name: 'Find' }))
    const hits = await screen.findAllByRole('button', { name: /^\+ Peppa Pig/ })
    expect(hits.map(b => b.textContent)).toEqual(['+ Peppa Pig TV show, 2004'])

    await u.clear(screen.getByLabelText('Title'))
    await u.type(screen.getByLabelText('Title'), 'ms rachel')
    await u.click(screen.getByRole('button', { name: 'Find' }))
    expect((await screen.findByText(/Nothing found/)).textContent).toBe('Nothing found for “ms rachel”. Try another spelling, or something else they love.')
    expect(screen.queryByRole('button', { name: /^\+ / })).toBeNull()

    await u.clear(screen.getByLabelText('Title'))
    await u.type(screen.getByLabelText('Title'), 'offline')
    await u.click(screen.getByRole('button', { name: 'Find' }))
    expect(await screen.findByText(/Search didn’t work/)).toBeTruthy()
  })
})
