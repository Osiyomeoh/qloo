import { useEffect, useMemo, useRef, useState } from 'react'
import type { AgentOutput, Pending, TraceEvent } from './agent/engine'
import type { Reaction, Trial } from './core/session'
import { score, guessAccuracy } from './core/session'
import { loadHistory, saveSession, knownFavourites, type Item } from './core/history'

export type AgentTransport = (body: unknown) => Promise<AgentOutput & { qlooMode?: string; error?: string }>

export const fetchTransport: AgentTransport = async body => {
  const res = await fetch('/api/agent', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  const out = await res.json().catch(() => ({ error: `agent error ${res.status}` }))
  if (!res.ok) throw new Error(out.error ?? `agent error ${res.status}`)
  return out
}

interface Card { id: string; name: string; image?: string }
const ICON: Record<TraceEvent['kind'], string> = { thought: '💭', tool: '🔎', result: '↳', error: '⚠️', ask: '👤', done: '🏁' }
const REACTIONS: Reaction[] = ['smile', 'laugh', 'reach', 'vocalise', 'look-away', 'push-away', 'distress']

export function AgentView({ seeds, notes, transport = fetchTransport }: { seeds: Card[]; notes: string; transport?: AgentTransport }) {
  const [out, setOut] = useState<AgentOutput & { qlooMode?: string }>()
  const [trace, setTrace] = useState<TraceEvent[]>([])
  const [trials, setTrials] = useState<Trial[]>([])
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const started = useRef(false)

  // names and images for any id the agent has seen (seeds + Qloo results), so cards never show model-invented labels
  const catalog = useMemo(() => {
    const m = new Map<string, Card>(seeds.map(s => [s.id, s]))
    for (const t of trace) {
      const ents = (t.data as { entities?: Card[] } | undefined)?.entities
      if (t.kind === 'result' && Array.isArray(ents)) for (const e of ents) m.set(e.id, e)
    }
    return m
  }, [seeds, trace])

  async function call(body: unknown) {
    setBusy(true); setError(undefined)
    try {
      const o = await transport(body)
      setOut(o); setTrace(t => [...t, ...o.trace])
    } catch (e) { setError((e as Error).message) }
    setBusy(false)
  }
  useEffect(() => {
    if (started.current) return
    started.current = true
    const h = loadHistory()
    const history = { sessions: h.length, favourites: knownFavourites(h).map(f => f.name), neverChosen: [...new Set(h.flatMap(r => r.neverChosen.map(n => n.name)))] }
    void call({ start: { seeds: seeds.map(({ id, name }) => ({ id, name })), notes, history } })
  })

  const respond = (pending: Pending, result: unknown) => {
    const { messages, steps, toolCalls } = out!
    setOut(undefined)
    void call({ state: { messages, steps, toolCalls }, pending, result })
  }

  const p = out?.pending
  const finished = p?.name === 'finish' ? (p.input as { summary: string; new_favourite_ids: string[]; next_time?: string }) : undefined
  return (
    <section className="agent">
      <h2>Agent session</h2>
      {out?.qlooMode === 'sample' && <p className="badge">Agent is live; Qloo results are sample data</p>}
      <ol className="trace" aria-label="Agent steps">
        {trace.map((t, i) => <li key={i} className={t.kind}><span aria-hidden>{ICON[t.kind]}</span> {t.kind === 'ask' ? askLabel(t) : t.kind === 'tool' || t.kind === 'result' ? <details><summary>{t.kind === 'tool' ? t.text.split(' ')[0] : 'result'}</summary><code>{t.kind === 'tool' ? t.text.slice(t.text.indexOf(' ') + 1) : t.text}</code></details> : t.text.replace(/\*\*/g, '')}</li>)}
        {busy && <li className="thinking" role="status">Thinking…</li>}
      </ol>
      {error && <p className="warn" role="alert">{error}</p>}
      {p?.name === 'present_choice' && (
        <AgentTrial key={p.id} pending={p} catalog={catalog} onDone={(t, result) => { setTrials(x => [...x, t]); respond(p, { ...(result as object), trials_so_far: trials.length + 1 }) }} />
      )}
      {p?.name === 'ask_carer' && <AskCarer pending={p} onAnswer={a => respond(p, { answer: a })} />}
      {finished && <Finish data={finished} trials={trials} catalog={catalog} seeds={seeds} />}
      {out?.done && !finished && <p>{out.done.reason === 'finished' ? out.done.text : 'Session limit reached.'}</p>}
    </section>
  )
}

const askLabel = (t: TraceEvent) => t.text === 'present_choice' ? `Asked you to show cards: ${(t.data as { why?: string })?.why ?? ''}` : t.text === 'ask_carer' ? `Asked you: ${(t.data as { question?: string })?.question ?? ''}` : 'Wrote the summary'

function AgentTrial({ pending, catalog, onDone }: { pending: Pending; catalog: Map<string, Card>; onDone: (t: Trial, result: unknown) => void }) {
  const { items, why } = pending.input as { items: Card[]; why: string }
  const cards = items.map(i => catalog.get(i.id) ?? i)
  const [guess, setGuess] = useState<string>()
  const [chosen, setChosen] = useState<string | null>()
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [show, setShow] = useState(false)
  const start = useRef(0)
  const [, tick] = useState(0)
  useEffect(() => { if (!chosen) return; const t = setInterval(() => tick(n => n + 1), 500); return () => clearInterval(t) }, [chosen])
  const secs = chosen ? Math.round((Date.now() - start.current) / 1000) : 0
  return (
    <div className="trial">
      <p className="why">{why}</p>
      {!guess && <p><strong>Carer first:</strong> which will they pick?</p>}
      {guess && chosen === undefined && <p>Now let them choose. Tap the one they reach for, look at, or ask for.</p>}
      <div className={`cards n${cards.length}`}>
        {cards.map(c => (
          <button key={c.id} className={`card ${chosen === c.id ? 'on' : ''}`} disabled={chosen !== undefined && chosen !== c.id}
            onClick={() => { if (!guess) setGuess(c.id); else if (chosen === undefined) { setChosen(c.id); start.current = Date.now() } }}>
            <CardFace c={c} />{guess === c.id && <small>carer's guess</small>}
          </button>
        ))}
      </div>
      {guess && chosen === undefined && <div className="row">
        <button className="secondary" onClick={() => setShow(true)}>Show to child, full screen</button>
        <button className="link" onClick={() => setChosen(null)}>No choice</button>
      </div>}
      {show && <ChildScreen cards={cards} onPick={id => { setChosen(id); start.current = Date.now() }} onClose={() => setShow(false)} />}
      {chosen && <>
        <p className="timer">Engaged: {secs}s</p>
        <div className="chips">{REACTIONS.map(r => <button key={r} className={reactions.includes(r) ? 'on' : ''} onClick={() => setReactions(x => x.includes(r) ? x.filter(y => y !== r) : [...x, r])}>{r}</button>)}</div>
      </>}
      {chosen !== undefined && <button onClick={() => {
        const t: Trial = { shown: cards.map(c => c.id), chosen: chosen ?? null, carerGuess: guess, engagementMs: chosen ? Date.now() - start.current : 0, reactions }
        onDone(t, { chosen_id: t.chosen, carer_guess_id: guess ?? null, engagement_seconds: Math.round((t.engagementMs ?? 0) / 1000), reactions })
      }}>{chosen ? 'They’re finished with it' : 'Next'}</button>}
    </div>
  )
}

function AskCarer({ pending, onAnswer }: { pending: Pending; onAnswer: (a: string) => void }) {
  const { question, options } = pending.input as { question: string; options: string[] }
  return <div className="trial"><p className="why">{question}</p><div className="chips">{options.map(o => <button key={o} onClick={() => onAnswer(o)}>{o}</button>)}</div></div>
}

function Finish({ data, trials, catalog, seeds }: { data: { summary: string; new_favourite_ids: string[]; next_time?: string }; trials: Trial[]; catalog: Map<string, Card>; seeds: Card[] }) {
  // Only celebrate favourites the logged choices actually support (chosen at least once, not a seed).
  const seedIds = new Set(seeds.map(s => s.id))
  const scored = score(trials).filter(s => s.chosen > 0)
  const chosenIds = new Set(scored.map(s => s.id))
  const confirmed = data.new_favourite_ids.filter(id => chosenIds.has(id) && !seedIds.has(id))
  const g = guessAccuracy(trials)
  const name = (id: string) => catalog.get(id)?.name ?? id
  const liked = [...new Set(trials.flatMap(t => t.reactions ?? []).filter(r => ['smile', 'laugh', 'reach', 'vocalise'].includes(r)))]
  const saved = useRef(false)
  useEffect(() => {
    if (saved.current) return
    saved.current = true
    const item = (id: string): Item => { const c = catalog.get(id); return { id, name: c?.name ?? id, ...(c?.image ? { image: c.image } : {}) } }
    const all = score(trials)
    saveSession({ date: new Date().toISOString(), favourites: [...confirmed, ...seeds.map(s => s.id)].map(item), chosen: scored.map(s => item(s.id)), neverChosen: all.filter(s => s.shown >= 2 && s.chosen === 0).map(s => item(s.id)) })
  })
  return (
    <div className="finish">
      {confirmed.length > 0 && <p className="win">New favourite found: {confirmed.map(name).join(', ')}</p>}
      <p>{data.summary.replace(/\*\*/g, '')}</p>
      {data.next_time && <p><strong>Next time:</strong> {data.next_time.replace(/\*\*/g, '')}</p>}
      <p className="src">Shown by choice: {trials.filter(t => t.chosen).length} choices in {trials.length} trials. Carer guessed right {g.matched} of {g.total}.</p>
      <article className="love" aria-label="What I love">
        <h3>What I love</h3>
        <p className="src">From a choice session on {new Date().toLocaleDateString()}. Every line below was chosen by me, not guessed for me.</p>
        <div className="love-grid">
          {[...confirmed, ...seeds.map(s => s.id), ...scored.map(s => s.id).filter(id => !confirmed.includes(id) && !seedIds.has(id))].map(id => {
            const s = scored.find(x => x.id === id)
            return <div key={id} className="love-item"><CardFace c={catalog.get(id) ?? { id, name: id }} /><small>{confirmed.includes(id) ? 'New favourite' : seedIds.has(id) ? 'Already loved' : 'Chosen'}{s ? ` · picked ${s.chosen}×` : ''}</small></div>
          })}
        </div>
        {liked.length > 0 && <p>When I like something I may: {liked.join(', ')}.</p>}
        {data.next_time && <p>Try next: {data.next_time.replace(/\*\*/g, '')}</p>}
      </article>
      <button className="secondary" onClick={() => window.print()}>Print or save as PDF</button>
      <p className="src">Saved on this device only, so the next session can build on it.</p>
    </div>
  )
}

const HUES = [12, 28, 160, 200, 260, 330]
/** Card picture, or a coloured tile with the first letter when Qloo has no image. */
export function CardFace({ c }: { c: Card }) {
  if (c.image) return <><img src={c.image} alt="" />{c.name}</>
  const h = HUES[[...c.name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % HUES.length]
  return <><span className="tile" aria-hidden style={{ background: `hsl(${h} 70% 55%)` }}>{c.name.replace(/^(the|a)\s+/i, '').charAt(0).toUpperCase()}</span>{c.name}</>
}

/** Full-screen, text-light view the carer turns towards the child. A tap is the choice. */
function ChildScreen({ cards, onPick, onClose }: { cards: Card[]; onPick: (id: string) => void; onClose: () => void }) {
  const [picked, setPicked] = useState<string>()
  return (
    <div className="child" role="dialog" aria-label="Child view">
      <div className={`child-cards n${cards.length}`}>
        {cards.map(c => (
          <button key={c.id} className={`child-card ${picked === c.id ? 'picked' : picked ? 'gone' : ''}`} disabled={!!picked}
            onClick={() => { setPicked(c.id); onPick(c.id); setTimeout(onClose, 1400) }}>
            <CardFace c={c} />
          </button>
        ))}
      </div>
      <button className="link child-close" onClick={onClose}>Back to carer view</button>
    </div>
  )
}
