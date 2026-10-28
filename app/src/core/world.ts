// Their world: two layers kept apart. Qloo says how items relate to each other (the links);
// only the person's own choices say where they stand (the status). A link is never evidence.
import { score, type Trial } from './session'
import type { SessionRecord } from './history'

export type Status = 'again' | 'once' | 'not-yet' | 'unseen'
export const STATUS_LABEL: Record<Status, string> = {
  again: 'Chosen again and again',
  once: 'Chosen once: offer it again',
  'not-yet': 'Not chosen yet (not a dislike)',
  unseen: 'Worth exploring: related on Qloo',
}

export interface WorldNode { id: string; name: string; image?: string; seed: boolean; status: Status; chosen: number; shown: number; sessions: number; link?: string; upset: boolean }

interface Ent { id: string; name: string; tags: string[]; image?: string }

/** Chosen at least twice and on at least half the times shown counts as "again and again". */
export function statusOf(chosen: number, shown: number): Status {
  if (!shown) return 'unseen'
  if (!chosen) return 'not-yet'
  return chosen >= 2 && chosen * 2 >= shown ? 'again' : 'once'
}

/** The Qloo tag a related item shares with the favourites, if any: why it's on the map. */
function link(e: Ent, seeds: Ent[]): string | undefined {
  const s = new Set(seeds.flatMap(x => x.tags))
  return e.tags.find(t => s.has(t))
}

export function buildWorld(seeds: Ent[], related: Ent[], trials: Trial[], history: SessionRecord[] = []): WorldNode[] {
  const sc = new Map(score(trials).map(s => [s.id, s]))
  const upset = new Set(trials.filter(t => t.chosen && t.reactions?.some(r => r === 'push-away' || r === 'distress')).map(t => t.chosen!))
  const sessions = (id: string) => history.filter(h => h.chosen.some(c => c.id === id)).length
  const seedIds = new Set(seeds.map(s => s.id))
  return [...seeds, ...related.filter(r => !seedIds.has(r.id))].map(e => {
    const s = sc.get(e.id)
    const seed = seedIds.has(e.id)
    return { id: e.id, name: e.name, image: e.image, seed, status: statusOf(s?.chosen ?? 0, s?.shown ?? 0), chosen: s?.chosen ?? 0, shown: s?.shown ?? 0, sessions: sessions(e.id), link: seed ? undefined : link(e, seeds), upset: upset.has(e.id) }
  })
}
