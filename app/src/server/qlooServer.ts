// QlooClient for server-side use (the agent): calls Qloo through the same
// allowlisting proxy logic as the browser path, without an extra HTTP hop.
import type { QlooClient } from '../qloo/client.js'
import { buildInsightsParams, buildSearchParams, type EntityType } from '../core/qlooRequest.js'
import { parseEntities } from '../qloo/parse.js'
import { proxyQloo } from './qlooProxy.js'

export class ServerQlooClient implements QlooClient {
  readonly mode = 'live' as const
  private key: string
  private f: typeof fetch
  constructor(key: string, f: typeof fetch = fetch) { this.key = key; this.f = f }
  private async get(op: string, p: URLSearchParams) {
    p.set('op', op)
    const res = await proxyQloo(new URL(`https://local/api/qloo?${p}`), this.key, this.f)
    const body = await res.json()
    if (!res.ok) throw new Error((body as { error?: string }).error ?? `Qloo ${res.status}`)
    return body
  }
  async search(query: string) { return parseEntities(await this.get('search', buildSearchParams(query)), 'movie') }
  async recommend(type: EntityType, seeds: string[], exclude: string[], ratings: string[]) {
    return parseEntities(await this.get('insights', buildInsightsParams({ type, seedEntityIds: seeds, excludeEntityIds: exclude, contentRatings: ratings })), type)
  }
}
