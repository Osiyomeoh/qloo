// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('full flow on sample data', () => {
  it('seed → suggestions → 6 paired choices → labelled profile', async () => {
    const u = userEvent.setup()
    render(<App />)
    expect(screen.getByRole('status').textContent).toMatch(/Sample data/)

    await u.type(screen.getByLabelText('Title'), 'thomas')
    await u.click(screen.getByRole('button', { name: 'Find' }))
    await u.click(await screen.findByRole('button', { name: '+ Thomas & Friends' }))
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
})
