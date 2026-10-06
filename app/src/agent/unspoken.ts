// The discovery agent. It plans and adapts a preference session: proposes
// candidates through Qloo, runs choice trials with the person via the UI,
// reads the results, and decides what to try next.
import type { ClientTool, ServerTool, Msg } from './engine.js'
import { knownIds } from './engine.js'
import type { QlooClient } from '../qloo/client.js'
import { KID_RATINGS } from '../qloo/client.js'
import type { EntityType } from '../core/qlooRequest.js'

const TYPES: EntityType[] = ['movie', 'tv_show', 'book', 'videogame', 'artist', 'podcast']

export const SYSTEM = `You help a carer discover new things a person loves when the person cannot easily say what they like (for example a minimally verbal autistic child, an adult with aphasia, or someone with profound disabilities). The person shows preference by choosing.

How you work (based on published preference-assessment methods):
- Use qloo_search to resolve titles and qloo_recommend to find candidates related to items the person has chosen. Qloo describes items, never the person.
- Run choices with present_choice: 2 cards by default (paired choice), up to 4 if the carer says the person handles more. Put one proven favourite in early sessions so the person experiences success.
- After each trial, decide what to do next and say why in one short sentence: stay close to what won, branch to another entity type (show → book, game, music) that shares the winner's tags, or drop a direction the person keeps rejecting (pass those ids as exclude).
- Stop and call finish when: the person stops choosing twice in a row, a negative reaction (push-away, distress) appears twice, you have run about 6 trials, or you found at least one new favourite confirmed twice.
- Only show items whose ids came from the carer's seeds or from Qloo results. Never invent titles.
- Use ask_carer only when an answer changes your next step (e.g. two plausible matches for a title, or whether loud audio is ok).

Language rules: describe what was chosen and how long they engaged. Do not diagnose, do not make clinical or therapy claims, do not guess the person's feelings beyond the reactions logged. Label Qloo-derived statements as being about the items. Keep every message to the carer short and warm.`

export function unspokenTools(qloo: QlooClient): { server: ServerTool[]; client: ClientTool[] } {
  const server: ServerTool[] = [
    {
      name: 'qloo_search',
      description: 'Resolve a title to Qloo entities. Returns up to 5 matches with id, name, type and tags.',
      input_schema: { type: 'object', properties: { title: { type: 'string' } }, required: ['title'] },
      async run(input) {
        const { title } = input as { title: string }
        return { entities: (await qloo.search(String(title))).map(slim) }
      },
    },
    {
      name: 'qloo_recommend',
      description: 'Qloo taste-graph candidates of one entity type related to seed entity ids. Age-appropriate ratings applied. Use exclude_ids for rejected or already shown items.',
      input_schema: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: TYPES },
          seed_ids: { type: 'array', items: { type: 'string' }, minItems: 1 },
          exclude_ids: { type: 'array', items: { type: 'string' } },
        },
        required: ['type', 'seed_ids'],
      },
      async run(input) {
        const { type, seed_ids, exclude_ids = [] } = input as { type: EntityType; seed_ids: string[]; exclude_ids?: string[] }
        if (!TYPES.includes(type)) throw new Error(`type must be one of ${TYPES.join(', ')}`)
        const r = await qloo.recommend(type, seed_ids, exclude_ids, KID_RATINGS)
        return { entities: r.slice(0, 8).map(slim), source: qloo.mode === 'sample' ? 'sample data' : 'Qloo' }
      },
    },
  ]
  const client: ClientTool[] = [
    {
      name: 'present_choice',
      description: 'Show 2-4 cards to the person. The carer first guesses, then the person chooses. Returns {chosen_id|null, carer_guess_id, engagement_seconds, reactions[]}.',
      input_schema: {
        type: 'object',
        properties: {
          items: { type: 'array', minItems: 2, maxItems: 4, items: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' } }, required: ['id', 'name'] } },
          why: { type: 'string', description: 'One sentence to the carer: why these cards now.' },
        },
        required: ['items', 'why'],
      },
      validate(input, messages: Msg[]) {
        const items = (input as { items?: { id: string }[] }).items
        if (!Array.isArray(items) || items.length < 2 || items.length > 4) return 'items must have 2 to 4 entries'
        if (new Set(items.map(i => i.id)).size !== items.length) return 'items must be distinct'
        const known = knownIds(messages)
        const unknown = items.filter(i => !known.has(i.id))
        return unknown.length ? `these ids did not come from the carer or Qloo: ${unknown.map(i => i.id).join(', ')}. Use qloo_search or qloo_recommend first.` : null
      },
    },
    {
      name: 'ask_carer',
      description: 'Ask the carer a short multiple-choice question. Returns {answer}.',
      input_schema: { type: 'object', properties: { question: { type: 'string' }, options: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 4 } }, required: ['question', 'options'] },
    },
    {
      name: 'finish',
      description: 'End the session with a short summary for the carer and the ids of new favourites (chosen at least twice, not among the seeds).',
      input_schema: { type: 'object', properties: { summary: { type: 'string' }, new_favourite_ids: { type: 'array', items: { type: 'string' } }, next_time: { type: 'string' } }, required: ['summary', 'new_favourite_ids'] },
    },
  ]
  return { server, client }
}

const slim = (e: { id: string; name: string; type: string; tags: string[]; image?: string }) => ({ id: e.id, name: e.name, type: e.type, tags: e.tags.slice(0, 6), ...(e.image ? { image: e.image } : {}) })

export function openingMessage(seeds: { id: string; name: string }[], notes: string): Msg {
  return { role: 'user', content: `Carer's goal: find new things they will love.\nKnown favourites (from the carer): ${JSON.stringify(seeds)}\nCarer notes: ${notes || 'none'}\nPlan the session and begin.` }
}
