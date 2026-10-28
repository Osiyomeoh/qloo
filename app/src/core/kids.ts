// What keeps the cards suitable for children, per category. Checked live 2026-10-06 with
// Thomas & Friends and Bluey as seeds: unfiltered, Qloo's podcasts for them were true crime,
// and its books and music followed the parents' taste.
// - Film and TV: Qloo's content-rating filter, checked again here (unrated is left out).
// - Books and music: Qloo's children's genre tags (picture books; The Wiggles, Raffi…).
// - Games: Qloo has no filter that works for them, so the ESRB rating is checked here.
// - Podcasts: Qloo's "Kids & Family" podcasts are for parents, so none are offered.
import type { EntityType } from './qlooRequest.js'
import type { Entity, QlooClient } from '../qloo/client.js'

export const KID_RATINGS = ['G', 'PG', 'TV-Y', 'TV-Y7', 'TV-G']
export const KID_GAME_RATINGS = ['E', 'E10+']
export const KID_TAGS: Partial<Record<EntityType, string>> = { book: 'urn:tag:genre:media:childrens', artist: 'urn:tag:genre:music:children' }
export const KID_TYPES: EntityType[] = ['movie', 'tv_show', 'book', 'videogame', 'artist']
export const TYPE_LABEL: Partial<Record<EntityType, string>> = { tv_show: 'TV show', movie: 'Film', book: 'Book', videogame: 'Game', artist: 'Music' }

/** Rated for adults (film, TV, ESRB). Unrated is kept: a favourite is what the carer says the child already loves. */
const ADULT_RATINGS = ['R', 'NC-17', 'TV-MA', 'M', 'AO']

/** Search hits a carer can add as a favourite. Qloo's search also returns places, brands, albums and podcasts
 *  under the same name ("Ms Rachel" gave a supermarket and a news podcast), and "Frozen" gave a 2010 R-rated film
 *  too. A favourite can become a card, so keep only what a child can be shown, once per name, kind and year, at most 5. */
export function favouriteHits(hits: Entity[]): Entity[] {
  const seen = new Set<string>()
  return hits.filter(h => {
    const key = `${h.type}|${h.name.toLowerCase()}|${h.year ?? ''}`
    if (!KID_TYPES.includes(h.type) || (h.rating && ADULT_RATINGS.includes(h.rating)) || seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, 5)
}

/** For results of a kids query: film, TV and games by rating; books and music were filtered by tag at Qloo. */
export function suitableForChildren(e: Entity): boolean {
  if (e.type === 'movie' || e.type === 'tv_show') return !!e.rating && KID_RATINGS.includes(e.rating)
  if (e.type === 'videogame') return !!e.rating && KID_GAME_RATINGS.includes(e.rating)
  return e.type in KID_TAGS
}

export async function recommendForKids(qloo: QlooClient, type: EntityType, seeds: string[], exclude: string[]): Promise<{ entities: Entity[]; leftOut: number }> {
  if (!KID_TYPES.includes(type)) throw new Error(`type must be one of ${KID_TYPES.join(', ')}`)
  const ratings = type === 'movie' || type === 'tv_show' ? KID_RATINGS : []
  const tag = KID_TAGS[type]
  const all = await qloo.recommend(type, seeds, exclude, ratings, tag ? [tag] : [])
  const entities = all.filter(suitableForChildren)
  return { entities, leftOut: all.length - entities.length }
}
