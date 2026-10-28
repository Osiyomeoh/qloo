// @vitest-environment jsdom
// Full stack except the network and the model: real UI → real handler → real agent loop → sample Qloo.
import { afterEach, describe, it, expect, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { handleAgent } from './server/agentHandler'
import type { Block, CallModel, ModelReply } from './agent/engine'

const use = (id: string, name: string, input: unknown): Block => ({ type: 'tool_use', id, name, input })
const turn = (...content: Block[]): ModelReply => ({ content, stop_reason: 'tool_use' })

describe('agent session in the app', () => {
  afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals() })
  it('agent reasons, calls Qloo, runs choices with the person, adapts, and celebrates only supported favourites', async () => {
    const script: ModelReply[] = [
      turn({ type: 'text', text: 'Start next to trains.' }, use('a', 'qloo_recommend', { type: 'tv_show', seed_ids: ['sample-0001'] })),
      turn(use('b', 'present_choice', { items: [{ id: 'sample-0001', name: 'Thomas & Friends' }, { id: 'sample-0003', name: 'Chuggington' }], why: 'A favourite beside a close match.' })),
      turn({ type: 'text', text: 'Chuggington won. Branch to films with trains.' }, use('c', 'qloo_recommend', { type: 'movie', seed_ids: ['sample-0003'] })),
      turn(use('d', 'present_choice', { items: [{ id: 'sample-0003', name: 'Chuggington' }, { id: 'sample-0005', name: 'The Polar Express' }], why: 'Does the train taste carry into films?' })),
      turn(use('e', 'finish', { summary: 'Trains carried across from shows to films.', new_favourite_ids: ['sample-0003', 'sample-0001'], next_time: 'Try a train picture book.' })),
      // sample-0001 was never chosen, so finish is rejected and the agent retries with what the log supports
      turn(use('f', 'finish', { summary: 'Trains carried across from shows to films.', new_favourite_ids: ['sample-0003'], next_time: 'Try a train picture book.' })),
    ]
    const callModel: CallModel = async () => script.shift()!
    const transport = async (body: unknown) => (await handleAgent(JSON.stringify(body), {}, { callModel })).json()

    const u = userEvent.setup()
    render(<App agent={transport} />)
    await u.type(screen.getByLabelText('Title'), 'thomas')
    await u.click(screen.getByRole('button', { name: 'Find' }))
    await u.click(await screen.findByRole('button', { name: /^\+ Thomas & Friends/ }))
    await u.type(screen.getByLabelText('Notes'), 'no loud audio')
    await u.click(screen.getByRole('button', { name: 'Let the agent run a session' }))

    expect(await screen.findByText('A favourite beside a close match.', { selector: '.why' })).toBeTruthy()
    const steps = screen.getByRole('list', { name: 'Agent steps' })
    expect(within(steps).getByText(/Start next to trains/)).toBeTruthy()
    expect(within(steps).getByText(/qloo_recommend/)).toBeTruthy()
    expect(screen.getByText('Agent is live; Qloo results are sample data')).toBeTruthy()

    const pick = async (guess: string, choice: string) => {
      const trial = document.querySelector('.trial') as HTMLElement
      await u.click(within(trial).getByRole('button', { name: new RegExp(guess) }))
      await u.click(within(trial).getByRole('button', { name: new RegExp(choice) }))
      await u.click(within(trial).getByRole('button', { name: 'smile' }))
      await u.click(within(trial).getByRole('button', { name: /finished/ }))
    }
    await pick('Thomas', 'Chuggington')
    expect(await screen.findByText('Does the train taste carry into films?', { selector: '.why' })).toBeTruthy()
    expect(within(steps).getByText(/Branch to films/)).toBeTruthy()
    // second trial goes through the full-screen child view
    const trial = document.querySelector('.trial') as HTMLElement
    await u.click(within(trial).getByRole('button', { name: /Polar/ }))
    await u.click(within(trial).getByRole('button', { name: /full screen/ }))
    const child = screen.getByRole('dialog', { name: 'Child view' })
    await u.click(within(child).getByRole('button', { name: /Chuggington/ }))
    await u.click(within(child).getByRole('button', { name: 'Back to carer view' }))
    await u.click(within(trial).getByRole('button', { name: 'smile' }))
    await u.click(within(trial).getByRole('button', { name: /finished/ }))

    // the agent first named a never-chosen seed; finish was rejected against the logged choices
    expect(await screen.findByText('New favourite found: Chuggington')).toBeTruthy()
    expect(screen.getByText(/Carer guessed right 0 of 2/)).toBeTruthy()
    expect(screen.getAllByText(/Try a train picture book/).length).toBe(2)
    const love = screen.getByRole('article', { name: 'What I love' })
    expect(within(love).getByText(/New favourite · picked 2×/)).toBeTruthy()
    expect(within(love).getByText(/Already loved/)).toBeTruthy()

    // their board: they tap a picture and the device says it
    const spoken: string[] = []
    vi.stubGlobal('SpeechSynthesisUtterance', class { text: string; voice = null; rate = 1; constructor(t: string) { this.text = t } })
    vi.stubGlobal('speechSynthesis', { getVoices: () => [], cancel() {}, speak: (u: { text: string }) => spoken.push(u.text) })
    await u.click(screen.getByRole('button', { name: 'Open their board' }))
    const board = screen.getByRole('dialog', { name: 'Their board' })
    expect(within(board).getAllByRole('button', { name: /Chuggington|Thomas/ }).length).toBe(2)
    await u.click(within(board).getByRole('button', { name: /Chuggington/ }))
    expect(spoken).toEqual(['I want Chuggington'])
    expect(within(board).getByText('I want Chuggington')).toBeTruthy()
    await u.click(within(board).getByRole('button', { name: 'Back to carer view' }))

    // the session is remembered on this device and offered next time
    cleanup()
    render(<App agent={transport} />)
    const last = screen.getByLabelText('Last time')
    expect(within(last).getByText(/Chuggington/)).toBeTruthy()
    await u.click(within(last).getByRole('button', { name: 'Open their board' }))
    await u.click(within(screen.getByRole('dialog', { name: 'Their board' })).getByRole('button', { name: /Thomas/ }))
    expect(spoken.at(-1)).toBe('I want Thomas & Friends')
    await u.click(screen.getByRole('button', { name: 'Back to carer view' }))
    await u.click(within(last).getByRole('button', { name: 'Start from last session' }))
    expect(screen.getByText(/Favourites: Chuggington, Thomas & Friends/)).toBeTruthy()
    await u.click(within(last).getByRole('button', { name: 'Forget' }))
    expect(screen.queryByLabelText('Last time')).toBeNull()
    expect(localStorage.getItem('unspoken.history.v1')).toBeNull()
  })

  it('stops in code when the person has had enough, and offers no more trials that day', async () => {
    const script: ModelReply[] = [
      turn(use('a', 'qloo_recommend', { type: 'tv_show', seed_ids: ['sample-0001'] })),
      turn(use('b', 'present_choice', { items: [{ id: 'sample-0001', name: 'Thomas & Friends' }, { id: 'sample-0003', name: 'Chuggington' }], why: 'First pair.' })),
      turn(use('c', 'present_choice', { items: [{ id: 'sample-0004', name: 'Blaze and the Monster Machines' }, { id: 'sample-0003', name: 'Chuggington' }], why: 'Second pair.' })),
      // the model wants one more; the stop rule refuses it
      turn(use('d', 'present_choice', { items: [{ id: 'sample-0001', name: 'Thomas & Friends' }, { id: 'sample-0004', name: 'Blaze and the Monster Machines' }], why: 'One more?' })),
      turn(use('e', 'finish', { summary: 'They had enough today, so we stopped.', new_favourite_ids: [] })),
    ]
    const callModel: CallModel = async () => script.shift()!
    const transport = async (body: unknown) => (await handleAgent(JSON.stringify(body), {}, { callModel })).json()
    const u = userEvent.setup()
    render(<App agent={transport} />)
    await u.type(screen.getByLabelText('Title'), 'thomas')
    await u.click(screen.getByRole('button', { name: 'Find' }))
    await u.click(await screen.findByRole('button', { name: /^\+ Thomas & Friends/ }))
    await u.click(screen.getByRole('button', { name: 'Let the agent run a session' }))
    const noChoice = async (why: string, guess: RegExp, reaction?: string) => {
      await screen.findByText(why, { selector: '.why' })
      const trial = document.querySelector('.trial') as HTMLElement
      await u.click(within(trial).getByRole('button', { name: guess }))
      await u.click(within(trial).getByRole('button', { name: 'No choice' }))
      if (reaction) await u.click(within(trial).getByRole('button', { name: reaction }))
      await u.click(within(trial).getByRole('button', { name: 'Next' }))
    }
    await noChoice('First pair.', /Thomas/)
    expect(screen.queryByText(/Stopped early/)).toBeNull()
    await noChoice('Second pair.', /Blaze/, 'push-away')
    expect(document.querySelector('.stopped')?.textContent).toMatch(/^Stopped early\. They stopped choosing twice in a row\. That's information too/)
    expect(await screen.findByText('They had enough today, so we stopped.')).toBeTruthy()
    expect(within(screen.getByRole('list', { name: 'Agent steps' })).getByText(/present_choice refused: stop rule/)).toBeTruthy()
    expect(screen.queryByText('One more?')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Start assessment' })).toBeNull()
    expect(screen.getByText('The preference assessment can wait for another day.')).toBeTruthy()
  })

  it('passes earlier sessions to the agent, capped and cleaned', async () => {
    let first = ''
    const callModel: CallModel = async (_s, messages) => { first ||= JSON.stringify(messages[0]); return turn({ type: 'text', text: 'ok' }) }
    await handleAgent(JSON.stringify({ start: { seeds: [{ id: 'sample-0001', name: 'Thomas & Friends' }], history: { sessions: 2, favourites: ['Chuggington', 7], neverChosen: ['Cars'] } } }), {}, { callModel })
    expect(first).toContain('Earlier sessions (2')
    expect(first).toContain('confirmed favourites: Chuggington.')
    expect(first).toContain('never chosen: Cars')
  })

  it('shows a clear error when the agent is not configured', async () => {
    const transport = async () => { throw new Error('The agent is not configured on this deployment') }
    const u = userEvent.setup()
    render(<App agent={transport} />)
    await u.type(screen.getByLabelText('Title'), 'cars')
    await u.click(screen.getByRole('button', { name: 'Find' }))
    await u.click(await screen.findByRole('button', { name: /^\+ Cars/ }))
    await u.click(screen.getByRole('button', { name: 'Let the agent run a session' }))
    expect((await screen.findByRole('alert')).textContent).toMatch(/not configured/)
  })
})
