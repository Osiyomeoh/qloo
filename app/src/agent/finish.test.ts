import { describe, it, expect } from 'vitest'
import type { Msg } from './engine'
import { validateFinish, choiceCounts } from './unspoken'

const trial = (k: number, chosen: string | null): Msg[] => [
  { role: 'assistant', content: [{ type: 'tool_use', id: `t${k}`, name: 'present_choice', input: {} }] },
  { role: 'user', content: [{ type: 'tool_result', tool_use_id: `t${k}`, content: JSON.stringify({ chosen_id: chosen }) }] },
]
const log = [...trial(1, 'a'), ...trial(2, 'b'), ...trial(3, 'a'), ...trial(4, null)]

describe('finish is checked against the logged choices', () => {
  it('counts choices from present_choice results only', () => {
    expect(Object.fromEntries(choiceCounts(log))).toEqual({ a: 2, b: 1 })
  })
  it('accepts a favourite chosen twice, or none', () => {
    expect(validateFinish({ summary: 's', new_favourite_ids: ['a'] }, log)).toBeNull()
    expect(validateFinish({ summary: 's', new_favourite_ids: [] }, log)).toBeNull()
  })
  it('rejects a favourite chosen once or never', () => {
    expect(validateFinish({ summary: 's', new_favourite_ids: ['a', 'b'] }, log)).toMatch(/^b chosen fewer than 2/)
    expect(validateFinish({ summary: 's', new_favourite_ids: ['zz'] }, log)).toMatch(/zz/)
  })
})
