// The browser holds the agent's state between requests (nothing is stored here), so the server signs what it
// hands out and only resumes from state it signed. Without this a client could send steps: 0 to reset the
// session's model and Qloo budgets, or write its own messages into the conversation.
// It caps each session; it doesn't limit how many sessions are started (an AWS budget alarm covers that).
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import type { AgentState, Pending } from '../agent/engine.js'

export interface SigEnv { AGENT_STATE_SECRET?: string; BEDROCK_SECRET_ACCESS_KEY?: string }

// Used only when neither secret is set: local dev and tests, which run in one process.
const PROCESS_KEY = randomBytes(32)

/** AGENT_STATE_SECRET if set; otherwise a key derived from the Bedrock secret, which every Vercel deployment
 *  that can run the agent already has. Derived under its own label, so a signature says nothing about the AWS key. */
function key(env: SigEnv): Buffer {
  const base = env.AGENT_STATE_SECRET || env.BEDROCK_SECRET_ACCESS_KEY
  return base ? createHmac('sha256', base).update('unspoken/agent-state/v1').digest() : PROCESS_KEY
}

// JSON.stringify gives the same text for an object and for its JSON round trip, so the browser's copy verifies.
const payload = (s: AgentState, p: Pending) => JSON.stringify([s.messages, s.steps, s.toolCalls, p])

export function signSession(env: SigEnv, state: AgentState, pending: Pending): string {
  return createHmac('sha256', key(env)).update(payload(state, pending)).digest('base64url')
}

export function verifySession(env: SigEnv, state: AgentState, pending: Pending, sig: unknown): boolean {
  if (typeof sig !== 'string') return false
  const want = Buffer.from(signSession(env, state, pending))
  const got = Buffer.from(sig)
  return got.length === want.length && timingSafeEqual(got, want)
}
