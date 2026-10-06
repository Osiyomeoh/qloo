// Photo → list of cultural item names, for the carer to confirm. The photo is
// sent only to the vision model, never to Qloo, and is not stored.
export const VISION_MODEL = 'claude-sonnet-5-5'
const PROMPT = 'List the titles of films, TV shows, books, video games, music artists or characters visible in this photo (covers, boxes, toys, posters). Reply with JSON only: {"items":[{"title":string,"kind":"movie"|"tv_show"|"book"|"video_game"|"artist"|"character"}]}. Do not describe any person. If none, return {"items":[]}.'
const KINDS = new Set(['movie', 'tv_show', 'book', 'video_game', 'artist', 'character'])
const MAX_BYTES = 5 * 1024 * 1024
const MEDIA = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export interface Detected { title: string; kind: string }

export function parseDetected(text: string): Detected[] {
  const m = text.match(/\{[\s\S]*\}/)
  if (!m) return []
  try {
    const items = (JSON.parse(m[0]) as { items?: unknown }).items
    if (!Array.isArray(items)) return []
    const seen = new Set<string>()
    return items.flatMap(i => {
      const t = typeof i?.title === 'string' ? i.title.trim().slice(0, 120) : ''
      const k = typeof i?.kind === 'string' && KINDS.has(i.kind) ? i.kind : 'movie'
      if (!t || seen.has(t.toLowerCase())) return []
      seen.add(t.toLowerCase())
      return [{ title: t, kind: k }]
    }).slice(0, 20)
  } catch { return [] }
}

export async function detectItems(body: { mediaType: string; data: string }, apiKey: string | undefined, f: typeof fetch = fetch): Promise<Response> {
  if (!apiKey) return json(503, { error: 'Photo detection is not configured on this deployment' })
  if (!MEDIA.has(body.mediaType)) return json(400, { error: 'unsupported image type' })
  if (!body.data || body.data.length * 0.75 > MAX_BYTES) return json(413, { error: 'image must be under 5 MB' })
  const res = await f('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: VISION_MODEL, max_tokens: 800,
      messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: body.mediaType, data: body.data } }, { type: 'text', text: PROMPT }] }],
    }),
    signal: AbortSignal.timeout(30_000),
  }).catch(() => undefined)
  if (!res?.ok) return json(502, { error: 'Photo detection failed' })
  const out = (await res.json()) as { content?: { type: string; text?: string }[] }
  const text = (out.content ?? []).filter(c => c.type === 'text').map(c => c.text).join('')
  return json(200, { items: parseDetected(text) })
}

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
