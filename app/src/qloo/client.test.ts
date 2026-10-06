import { describe, it, expect } from 'vitest'
import { SampleClient, KID_RATINGS } from './client'

describe('sample client', () => {
  const c = new SampleClient()
  it('is labelled as sample', () => expect(c.mode).toBe('sample'))
  it('searches by title', async () => expect((await c.search('thomas'))[0].id).toBe('sample-0001'))
  it('recommends related items, excluding seeds, exclusions and out-of-rating items', async () => {
    const r = await c.recommend('tv_show', ['sample-0001'], ['sample-0003'], KID_RATINGS)
    const ids = r.map(e => e.id)
    expect(ids).not.toContain('sample-0001')
    expect(ids).not.toContain('sample-0003')
    expect(ids).not.toContain('sample-0008') // R-rated
    expect(ids.slice(0, 3).sort()).toEqual(['sample-0004', 'sample-0005', 'sample-0007']) // 2 shared tags each, ties by name
  })
  it('rejects non-id seeds via the privacy guard', async () => {
    await expect(c.recommend('movie', ['Tolu Ade'], [], [])).rejects.toThrow()
  })
})
