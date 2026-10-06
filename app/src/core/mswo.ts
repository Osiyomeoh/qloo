// Multiple-stimulus without replacement (MSWO; DeLeon & Iwata, 1996). Show the whole array; the
// item chosen is removed and the rest are rotated (leftmost to the end) so position doesn't decide;
// repeat until everything is chosen or the person chooses nothing. Several administrations (rounds).
// Selection % per item = times chosen / trials it was available. Higher % = more preferred.
// This is plain code, not the agent: the agent only proposes which items go in.
export interface MswoTrial { round: number; array: string[]; chosen: string | null }
export interface MswoRank { id: string; chosen: number; available: number; pct: number; rank: number }

export const MSWO_ITEMS = { min: 3, max: 6 }
export const MSWO_ROUNDS = 3

/** Starting array for a round: each round starts one place further rotated, so first positions vary. */
export function roundStart(items: string[], round: number): string[] {
  const k = round % items.length
  return [...items.slice(k), ...items.slice(0, k)]
}

/** The next array to show, or null when the round (or the whole assessment) is over. */
export function nextArray(items: string[], trials: MswoTrial[], rounds = MSWO_ROUNDS): { round: number; array: string[] } | null {
  if (!trials.length) return { round: 0, array: roundStart(items, 0) }
  const last = trials[trials.length - 1]
  const remaining = last.chosen ? last.array.filter(id => id !== last.chosen) : []
  if (remaining.length) return { round: last.round, array: [...remaining.slice(1), remaining[0]] }
  return last.round + 1 < rounds ? { round: last.round + 1, array: roundStart(items, last.round + 1) } : null
}

export function rankMswo(trials: MswoTrial[]): MswoRank[] {
  const m = new Map<string, { chosen: number; available: number }>()
  for (const t of trials) for (const id of t.array) {
    const s = m.get(id) ?? { chosen: 0, available: 0 }
    s.available++
    if (t.chosen === id) s.chosen++
    m.set(id, s)
  }
  const rows = [...m].map(([id, s]) => ({ id, ...s, pct: Math.round((s.chosen / s.available) * 100) }))
  rows.sort((a, b) => b.pct - a.pct || b.chosen - a.chosen)
  // ties share a rank (standard competition ranking)
  return rows.map((r, i) => ({ ...r, rank: rows.findIndex(x => x.pct === r.pct && x.chosen === r.chosen) + 1 || i + 1 }))
}
