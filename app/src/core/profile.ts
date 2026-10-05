// One-page profile. Every line states its source so Qloo affinities about items
// are never presented as facts about the person (kit docs/SAFE_USE.md).
import type { Item } from './session'
import { score, type Trial } from './session'

export type ProfileLine =
  | { source: 'choice'; text: string }
  | { source: 'qloo'; text: string }
  | { source: 'carer'; text: string }

export function sharedTags(tagsByItem: Record<string, string[]>, minItems = 2): string[] {
  const count = new Map<string, number>()
  for (const tags of Object.values(tagsByItem)) for (const t of new Set(tags)) count.set(t, (count.get(t) ?? 0) + 1)
  return [...count.entries()].filter(([, n]) => n >= minItems).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([t]) => t)
}

export function buildProfile(items: Item[], trials: Trial[], tagsByItem: Record<string, string[]>, carerNotes: string[] = []): ProfileLine[] {
  const title = new Map(items.map(i => [i.id, i.title]))
  const lines: ProfileLine[] = []
  for (const s of score(trials).filter(s => s.chosen > 0)) {
    lines.push({ source: 'choice', text: `Chose ${title.get(s.id) ?? s.id} ${s.chosen} of ${s.shown} times (${Math.round(s.engagementMs / 1000)}s engaged)` })
  }
  const tags = sharedTags(tagsByItem)
  if (tags.length) lines.push({ source: 'qloo', text: `These items have in common: ${tags.slice(0, 5).join(', ')}` })
  for (const n of carerNotes) lines.push({ source: 'carer', text: n })
  return lines
}

export const SOURCE_LABEL = { choice: 'Shown by choice', qloo: 'Qloo: about the items', carer: 'From carer' } as const
