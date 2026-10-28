// What earlier sessions found, kept on this device only (localStorage). Nothing about the child
// leaves the device except item ids and names, which are sent to the agent to plan the next session.
export interface Item { id: string; name: string; image?: string }
export interface MswoResult { id: string; name: string; pct: number; rank: number }
export interface SessionRecord { date: string; favourites: Item[]; chosen: Item[]; neverChosen: Item[]; mswo?: MswoResult[] }

const KEY = 'unspoken.history.v1'
const MAX = 20

export function loadHistory(): SessionRecord[] {
  try { const v = JSON.parse(localStorage.getItem(KEY) ?? '[]'); return Array.isArray(v) ? v : [] } catch { return [] }
}
/** replaceLast: a later round of the same visit updates that visit's record instead of adding a session. */
export function saveSession(r: SessionRecord, replaceLast = false): SessionRecord[] {
  const h = loadHistory()
  const next = [...(replaceLast ? h.slice(0, -1) : h), r].slice(-MAX)
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* private mode: keep going without memory */ }
  return next
}
/** Attach an assessment result to the most recent session. */
export function saveMswo(results: MswoResult[]): SessionRecord[] {
  const h = loadHistory()
  if (!h.length) return h
  h[h.length - 1] = { ...h[h.length - 1], mswo: results }
  try { localStorage.setItem(KEY, JSON.stringify(h)) } catch { /* keep going without memory */ }
  return h
}

/** Per item, its selection % in each assessed session (oldest first). Items assessed only once still appear. */
export function mswoSeries(h: SessionRecord[]): { dates: string[]; items: { id: string; name: string; pcts: (number | null)[] }[] } {
  const assessed = h.filter(r => r.mswo?.length)
  const items = new Map<string, { id: string; name: string; pcts: (number | null)[] }>()
  assessed.forEach((r, i) => { for (const m of r.mswo!) { const it = items.get(m.id) ?? { id: m.id, name: m.name, pcts: Array(assessed.length).fill(null) }; it.pcts[i] = m.pct; items.set(m.id, it) } })
  return { dates: assessed.map(r => r.date), items: [...items.values()] }
}

export function forgetHistory() { try { localStorage.removeItem(KEY) } catch { /* nothing stored */ } }

/** Favourites across sessions, most recent first, without repeats. */
export function knownFavourites(h: SessionRecord[]): Item[] {
  const seen = new Set<string>(), out: Item[] = []
  for (const s of [...h].reverse()) for (const f of s.favourites) if (!seen.has(f.id)) { seen.add(f.id); out.push(f) }
  return out
}

/** Compact summary for the agent's opening message. */
export function historyBrief(h: { favourites: string[]; neverChosen: string[]; sessions: number }): string {
  if (!h.sessions) return ''
  return `\nEarlier sessions (${h.sessions}, from the carer's device): confirmed favourites: ${h.favourites.join(', ') || 'none'}. Shown repeatedly but never chosen: ${h.neverChosen.join(', ') || 'none'}. Build on the favourites and avoid the never-chosen.`
}
