// Server-side proxy logic. Holds the key; forwards only allowlisted public
// signals; surfaces auth/rate-limit errors instead of falling back (kit docs/API_ACCESS.md).
import { assertOnlyPublicSignals, assertSearchParams } from '../core/qlooRequest.js'

export const QLOO_BASE = 'https://hackathon.api.qloo.com'

export async function proxyQloo(url: URL, apiKey: string | undefined, f: typeof fetch = fetch): Promise<Response> {
  if (!apiKey) return json(503, { error: 'Live Qloo is not configured on this deployment' })
  const op = url.searchParams.get('op')
  const params = new URLSearchParams(url.searchParams)
  params.delete('op')
  let path: string
  try {
    if (op === 'search') { assertSearchParams(params); path = '/search' }
    else if (op === 'insights') { assertOnlyPublicSignals(params); path = '/v2/insights' }
    else return json(400, { error: 'unknown op' })
  } catch (e) {
    return json(400, { error: (e as Error).message })
  }
  const ctrl = AbortSignal.timeout(10_000)
  let res: Response
  try {
    res = await f(`${QLOO_BASE}${path}?${params}`, { headers: { 'X-Api-Key': apiKey, accept: 'application/json' }, signal: ctrl })
  } catch {
    return json(502, { error: 'Qloo did not respond' })
  }
  if (res.status === 401 || res.status === 403) return json(502, { error: 'Qloo rejected the credential' })
  if (res.status === 429) return json(429, { error: 'Qloo rate limit reached; try again shortly' })
  if (!res.ok) return json(502, { error: `Qloo error ${res.status}` })
  return new Response(await res.text(), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } })
}

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
