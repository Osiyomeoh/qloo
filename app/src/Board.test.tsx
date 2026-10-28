// @vitest-environment jsdom
import { afterEach, describe, it, expect, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Board } from './Board'
import { speak } from './say'

const cards = [{ id: 'a', name: 'Chuggington' }, { id: 'b', name: 'Bluey' }]

describe('their board', () => {
  afterEach(() => { cleanup(); vi.unstubAllGlobals() })
  it('shows the words when the device cannot speak', async () => {
    vi.stubGlobal('speechSynthesis', undefined)
    expect(speak('I want Bluey')).toBe(false)
    const u = userEvent.setup()
    render(<Board cards={cards} onClose={() => {}} />)
    const board = screen.getByRole('dialog', { name: 'Their board' })
    await u.click(within(board).getByRole('button', { name: /Bluey/ }))
    expect(within(board).getByText('I want Bluey')).toBeTruthy()
    expect(within(board).getByText(/can't speak, so the words show above/)).toBeTruthy()
  })
  it('prefers a voice that runs on the device', () => {
    const said: { text: string; voice: unknown }[] = []
    vi.stubGlobal('SpeechSynthesisUtterance', class { text: string; voice: unknown = null; rate = 1; constructor(t: string) { this.text = t } })
    const online = { localService: false, default: true, lang: 'en-US' }, local = { localService: true, default: false, lang: 'en-GB' }
    vi.stubGlobal('speechSynthesis', { getVoices: () => [online, local], cancel() {}, speak: (u: { text: string; voice: unknown }) => said.push(u) })
    expect(speak('I want Chuggington')).toBe(true)
    expect(said).toEqual([expect.objectContaining({ text: 'I want Chuggington', voice: local })])
  })
  it('caps the board at six pictures', () => {
    render(<Board cards={Array.from({ length: 9 }, (_, k) => ({ id: `${k}`, name: `Item ${k}` }))} onClose={() => {}} />)
    expect(within(screen.getByRole('dialog')).getAllByRole('button', { name: /Item/ }).length).toBe(6)
  })
})
