// What earlier sessions found, kept on this device only (localStorage). Nothing about the child
// leaves the device except item ids and names, which are sent to the agent to plan the next session.
export interface Item { id: string; name: string; image?: string }
export interface SessionRecord { date: string; favourites: Item[]; chosen: Item[]; neverChosen: Item[] }

const KEY = 'unspoken.history.v1'
const MAX = 20

export function loadHistory(): SessionRecord[] {
  try { const v = JSON.parse(localStorage.getItem(KEY) ?? '[]'); return Array.isArray(v) ? v : [] } catch { return [] }
}
export function saveSession(r: SessionRecord): SessionRecord[] {
  const next = [...loadHistory(), r].slice(-MAX)
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* private mode: keep going without memory */ }
  return next
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
