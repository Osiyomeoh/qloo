import { describe, it, expect } from 'vitest'
import type { Msg } from './engine'
import { validateFinish, choiceCounts, unspokenTools } from './unspoken'
import { SampleClient } from '../qloo/client'
import { stopReason } from '../core/session'

const trial = (k: number, chosen: string | null, reactions: string[] = []): Msg[] => [
  { role: 'assistant', content: [{ type: 'tool_use', id: `t${k}`, name: 'present_choice', input: {} }] },
  { role: 'user', content: [{ type: 'tool_result', tool_use_id: `t${k}`, content: JSON.stringify({ chosen_id: chosen, reactions }) }] },
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

describe('the stop rule is enforced, not just asked for', () => {
  const opening: Msg = { role: 'user', content: 'Known favourites (from the carer): [{"id":"a","name":"A"},{"id":"b","name":"B"}]' }
  const present = unspokenTools(new SampleClient()).client.find(t => t.name === 'present_choice')!
  const show = (log: Msg[]) => present.validate!({ items: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], why: 'w' }, [opening, ...log])
  it('stops after no choice twice in a row', () => {
    expect(show([...trial(1, null), ...trial(2, null)])).toMatch(/^stop rule: they stopped choosing twice in a row\. Show no more cards\. Call finish/)
    expect(stopReason([{ chosen: null }, { chosen: null }])).toBe('They stopped choosing twice in a row')
  })
  it('stops after push-away or distress on two trials, even when a card was chosen', () => {
    expect(show([...trial(1, 'a', ['push-away']), ...trial(2, 'b'), ...trial(3, 'a', ['distress', 'smile'])])).toMatch(/pushed away or were upset twice/)
  })
  it('keeps going after one no-choice, or no-choices that are not in a row, or one upset', () => {
    expect(show([...trial(1, null), ...trial(2, 'a'), ...trial(3, null)])).toBeNull()
    expect(show([...trial(1, 'a', ['push-away'])])).toBeNull()
  })
  it('lets the agent finish after a stop', () => {
    expect(validateFinish({ summary: 'They had enough today.', new_favourite_ids: [] }, [...trial(1, null), ...trial(2, null)])).toBeNull()
  })
})
