// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { prose, inline } from './prose'

describe('prose', () => {
  it('renders the agent plan as a paragraph and a list, without stray asterisks', () => {
    const { container } = render(<div>{prose('Here is my plan:\n- Trial 1–2: pair *Edward the Blue Engine* with **Barney**\n- Trial 3–4: follow the winner\n\nLet\'s begin.')}</div>)
    expect([...container.querySelectorAll('p')].map(p => p.textContent)).toEqual(['Here is my plan:', 'Let\'s begin.'])
    expect([...container.querySelectorAll('ul > li')].map(li => li.textContent)).toEqual(['Trial 1–2: pair Edward the Blue Engine with Barney', 'Trial 3–4: follow the winner'])
    expect(container.querySelector('em')?.textContent).toBe('Edward the Blue Engine')
    expect(container.querySelector('strong')?.textContent).toBe('Barney')
    expect(container.textContent).not.toContain('*')
  })

  it('keeps numbered lists ordered and turns headings into bold lines', () => {
    const { container } = render(<div>{prose('## Plan\n1. Chuggington\n2. Fireman Sam')}</div>)
    expect(container.querySelector('p > strong')?.textContent).toBe('Plan')
    expect(container.querySelectorAll('ol > li')).toHaveLength(2)
  })

  it('treats markup as text, never as HTML', () => {
    const { container } = render(<div>{inline('<img src=x onerror=alert(1)> **ok**')}</div>)
    expect(container.querySelector('img')).toBeNull()
    expect(container.textContent).toBe('<img src=x onerror=alert(1)> ok')
  })
})
