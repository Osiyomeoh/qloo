import { describe, it, expect, vi } from 'vitest'
import { proxyQloo } from './qlooProxy'
import { parseDetected, detectItems } from './vision'
import { parseEntities } from '../qloo/parse'
import { LiveClient } from '../qloo/client'

const ok = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })
const u = (q: string) => new URL(`https://x.test/api/qloo?${q}`)

describe('qloo proxy', () => {
  it('503 without a key, never calling Qloo', async () => {
    const f = vi.fn()
    expect((await proxyQloo(u('op=search&query=cars'), undefined, f)).status).toBe(503)
    expect(f).not.toHaveBeenCalled()
  })
  it('forwards allowlisted insights with the key header and without op', async () => {
    const f = vi.fn(async () => ok({ results: { entities: [] } }))
    const r = await proxyQloo(u('op=insights&filter.type=urn:entity:movie&signal.interests.entities=abcdefgh-1&take=5'), 'K', f as unknown as typeof fetch)
    expect(r.status).toBe(200)
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://hackathon.api.qloo.com/v2/insights?filter.type=urn%3Aentity%3Amovie&signal.interests.entities=abcdefgh-1&take=5')
    expect((init.headers as Record<string, string>)['X-Api-Key']).toBe('K')
  })
  it('blocks personal/demographic params before calling Qloo', async () => {
    const f = vi.fn()
    for (const q of ['op=insights&signal.demographics.age=36_to_55', 'op=insights&signal.location=POINT(1 1)', 'op=search&query=x&name=Tolu']) {
      expect((await proxyQloo(u(q), 'K', f)).status).toBe(400)
    }
    expect(f).not.toHaveBeenCalled()
  })
  it('surfaces auth and rate-limit errors without fallback', async () => {
    expect((await proxyQloo(u('op=search&query=cars'), 'K', (async () => ok({}, 401)) as typeof fetch)).status).toBe(502)
    expect((await proxyQloo(u('op=search&query=cars'), 'K', (async () => ok({}, 429)) as typeof fetch)).status).toBe(429)
    expect((await proxyQloo(u('op=nope'), 'K', vi.fn())).status).toBe(400)
  })
})

describe('response parsing', () => {
  it('handles results arrays and results.entities, skips malformed rows', () => {
    const body = { results: { entities: [
      { entity_id: 'E1', name: 'Cars', types: ['urn:entity:movie'], tags: [{ name: 'racing' }, 'animation'], properties: { content_rating: 'G', image: { url: 'https://i/x.jpg' } } },
      { name: 'no id' }, null,
    ] } }
    expect(parseEntities(body, 'tv_show')).toEqual([{ id: 'E1', name: 'Cars', type: 'movie', tags: ['racing', 'animation'], rating: 'G', image: 'https://i/x.jpg' }])
    expect(parseEntities({ results: [{ id: 'E2', name: 'Bluey' }] }, 'tv_show')[0]).toMatchObject({ id: 'E2', type: 'tv_show', tags: [] })
    expect(parseEntities('garbage', 'movie')).toEqual([])
  })
})

describe('live client', () => {
  it('sends op + guarded params to our proxy, and reports proxy errors', async () => {
    const f = vi.fn(async () => ok({ results: [{ id: 'E2', name: 'Bluey' }] }))
    const c = new LiveClient(f as unknown as typeof fetch)
    expect((await c.search('bluey'))[0].name).toBe('Bluey')
    expect(String((f.mock.calls[0] as unknown as [string])[0])).toBe('/api/qloo?query=bluey&take=5&op=search')
    const bad = new LiveClient((async () => ok({ error: 'Qloo rate limit reached; try again shortly' }, 429)) as typeof fetch)
    await expect(bad.recommend('movie', ['abcdefgh-1'], [], [])).rejects.toThrow(/rate limit/)
  })
})

describe('vision', () => {
  it('parses model JSON, dedupes, caps length, drops bad kinds', () => {
    expect(parseDetected('Sure: {"items":[{"title":"Cars","kind":"movie"},{"title":"cars","kind":"movie"},{"title":"Bluey","kind":"weird"},{"title":""}]}'))
      .toEqual([{ title: 'Cars', kind: 'movie' }, { title: 'Bluey', kind: 'movie' }])
    expect(parseDetected('no json')).toEqual([])
  })
  it('validates input and needs a key', async () => {
    expect((await detectItems({ mediaType: 'image/png', data: 'x' }, undefined)).status).toBe(503)
    expect((await detectItems({ mediaType: 'text/html', data: 'x' }, 'K')).status).toBe(400)
    expect((await detectItems({ mediaType: 'image/png', data: 'a'.repeat(8_000_000) }, 'K')).status).toBe(413)
  })
  it('calls the model with the image and returns items only', async () => {
    const f = vi.fn(async () => ok({ content: [{ type: 'text', text: '{"items":[{"title":"Thomas & Friends","kind":"tv_show"}]}' }] }))
    const r = await detectItems({ mediaType: 'image/jpeg', data: 'abc' }, 'K', f as unknown as typeof fetch)
    expect(await r.json()).toEqual({ items: [{ title: 'Thomas & Friends', kind: 'tv_show' }] })
  })
})
