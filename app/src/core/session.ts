// Choice session engine. Formats follow published preference assessments:
// paired-stimulus (Fisher et al. 1992) and MSWO (DeLeon & Iwata 1996).
// No item is ever taken away mid-engagement; we record engagement time instead.

export interface Item { id: string; title: string; source: 'seed' | 'qloo' | 'carer' }

export interface Trial {
  shown: string[]
  chosen: string | null // null = no choice
  carerGuess?: string
  engagementMs?: number
  reactions?: Reaction[]
}

export type Reaction = 'smile' | 'laugh' | 'reach' | 'vocalise' | 'look-away' | 'push-away' | 'distress'
export const POSITIVE: ReadonlySet<Reaction> = new Set(['smile', 'laugh', 'reach', 'vocalise'])

/** All unordered pairs, each item appearing in both positions across the schedule. */
export function pairedSchedule(ids: string[]): string[][] {
  const pairs: string[][] = []
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++)
      pairs.push((i + j) % 2 === 0 ? [ids[i], ids[j]] : [ids[j], ids[i]])
  return pairs
}

/** MSWO: next array shows everything not yet chosen. Returns null when done. */
export function nextMswoArray(ids: string[], trials: Trial[], maxShown = 4): string[] | null {
  const chosen = new Set(trials.map(t => t.chosen).filter((c): c is string => c !== null))
  const remaining = ids.filter(id => !chosen.has(id))
  if (remaining.length === 0) return null
  if (trials.length > 0 && trials[trials.length - 1].chosen === null) return null // stop on no choice
  return remaining.slice(0, maxShown)
}

export interface Score { id: string; shown: number; chosen: number; selectionPct: number; engagementMs: number; positive: number }

export function score(trials: Trial[]): Score[] {
  const m = new Map<string, Score>()
  const get = (id: string) => {
    let s = m.get(id)
    if (!s) m.set(id, (s = { id, shown: 0, chosen: 0, selectionPct: 0, engagementMs: 0, positive: 0 }))
    return s
  }
  for (const t of trials) {
    for (const id of t.shown) get(id).shown++
    if (t.chosen) {
      const s = get(t.chosen)
      s.chosen++
      s.engagementMs += t.engagementMs ?? 0
      s.positive += (t.reactions ?? []).filter(r => POSITIVE.has(r)).length
    }
  }
  const out = [...m.values()]
  for (const s of out) s.selectionPct = s.shown ? Math.round((100 * s.chosen) / s.shown) : 0
  return out.sort((a, b) => b.selectionPct - a.selectionPct || b.engagementMs - a.engagementMs || a.id.localeCompare(b.id))
}

/** How often the carer's guess matched the actual choice (trials with both). */
export function guessAccuracy(trials: Trial[]): { matched: number; total: number } {
  const both = trials.filter(t => t.carerGuess && t.chosen)
  return { matched: both.filter(t => t.carerGuess === t.chosen).length, total: both.length }
}

/** Learning step: chosen items become signals; items shown repeatedly and never chosen are excluded. */
export function nextSignals(trials: Trial[], minShownToExclude = 2) {
  const s = score(trials)
  return {
    signal: s.filter(x => x.chosen > 0).map(x => x.id),
    exclude: s.filter(x => x.chosen === 0 && x.shown >= minShownToExclude).map(x => x.id),
  }
}
