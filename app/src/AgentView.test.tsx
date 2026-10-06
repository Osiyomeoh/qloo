// @vitest-environment jsdom
// Full stack except the network and the model: real UI → real handler → real agent loop → sample Qloo.
import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { handleAgent } from './server/agentHandler'
import type { Block, CallModel, ModelReply } from './agent/engine'

const use = (id: string, name: string, input: unknown): Block => ({ type: 'tool_use', id, name, input })
const turn = (...content: Block[]): ModelReply => ({ content, stop_reason: 'tool_use' })

describe('agent session in the app', () => {
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
    await u.click(await screen.findByRole('button', { name: '+ Thomas & Friends' }))
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
    await pick('Polar', 'Chuggington')

    // the agent first named a never-chosen seed; finish was rejected against the logged choices
    expect(await screen.findByText('New favourite found: Chuggington')).toBeTruthy()
    expect(screen.getByText(/Carer guessed right 0 of 2/)).toBeTruthy()
    expect(screen.getByText(/Try a train picture book/)).toBeTruthy()
  })

  it('shows a clear error when the agent is not configured', async () => {
    const transport = async () => { throw new Error('The agent is not configured on this deployment') }
    const u = userEvent.setup()
    render(<App agent={transport} />)
    await u.type(screen.getByLabelText('Title'), 'cars')
    await u.click(screen.getByRole('button', { name: 'Find' }))
    await u.click(await screen.findByRole('button', { name: '+ Cars' }))
    await u.click(screen.getByRole('button', { name: 'Let the agent run a session' }))
    expect((await screen.findByRole('alert')).textContent).toMatch(/not configured/)
  })
})
