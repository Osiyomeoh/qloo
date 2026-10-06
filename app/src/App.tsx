import { useEffect, useMemo, useRef, useState } from 'react'
import { SampleClient, KID_RATINGS, type Entity, type QlooClient } from './qloo/client'
import { pairedSchedule, score, guessAccuracy, nextSignals, type Reaction, type Trial } from './core/session'
import { buildProfile, SOURCE_LABEL } from './core/profile'
import { AgentView, type AgentTransport } from './AgentView'
import { loadHistory, forgetHistory, knownFavourites } from './core/history'

export const APP_NAME = 'Unspoken'

type Step = 'seed' | 'propose' | 'session' | 'profile' | 'agent'
const REACTIONS: Reaction[] = ['smile', 'laugh', 'reach', 'vocalise', 'look-away', 'push-away', 'distress']

export default function App({ client = new SampleClient() as QlooClient, agent }: { client?: QlooClient; agent?: AgentTransport }) {
  const [notes, setNotes] = useState('')
  const [step, setStep] = useState<Step>('seed')
  const [seeds, setSeeds] = useState<Entity[]>([])
  const [proposals, setProposals] = useState<Entity[]>([])
  const [trials, setTrials] = useState<Trial[]>([])

  const all = useMemo(() => [...seeds, ...proposals], [seeds, proposals])
  const byId = useMemo(() => new Map(all.map(e => [e.id, e])), [all])

  async function propose() {
    const { exclude } = nextSignals(trials)
    const chosen = nextSignals(trials).signal.filter(id => !seeds.some(s => s.id === id))
    const seedIds = [...seeds.map(s => s.id), ...chosen]
    const r = await client.recommend(seeds[0].type, seedIds, exclude, KID_RATINGS)
    setProposals(prev => [...prev.filter(p => chosen.includes(p.id)), ...r.filter(e => !prev.some(p => p.id === e.id && chosen.includes(p.id)))].slice(0, 6))
    setStep('propose')
  }

  return (
    <main>
      <header>
        <h1>{APP_NAME}</h1>
        <p className="pitch">Find what a non-speaking child loves, by letting them choose. An agent picks a few things to show, you log which one they reach for, and it learns from every choice.</p>
        {step === 'seed' && <ol className="how"><li><b>1</b>Name one thing they already love</li><li><b>2</b>The agent picks 2–4 things to show</li><li><b>3</b>Their choices become a one-page profile</li></ol>}
        {client.mode === 'sample' && <p className="badge" role="status">Sample data — not live Qloo results</p>}
      </header>
      {step === 'seed' && <>
        <SeedStep client={client} seeds={seeds} setSeeds={setSeeds} onNext={propose} />
        <label className="notes">Anything the agent should know? (optional, no names)
          <input aria-label="Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. no loud audio; manages 2 cards" />
        </label>
        <button className="primary" onClick={() => setStep('agent')} disabled={!seeds.length}>Let the agent run a session</button>
      </>}
      {step === 'agent' && <AgentView seeds={seeds.map(s => ({ id: s.id, name: s.name, image: s.image }))} notes={notes} transport={agent} />}
      {step === 'propose' && (
        <section>
          <h2>Things to try</h2>
          <p className="src">{SOURCE_LABEL.qloo}: related to {seeds.map(s => s.name).join(', ')}. Age-rated.</p>
          <ul className="list">{proposals.map(p => <li key={p.id}>{p.name} <small>{p.tags.join(' · ')}</small></li>)}</ul>
          <button onClick={() => setStep('session')} disabled={!proposals.length}>Start a choice session</button>
        </section>
      )}
      {step === 'session' && (
        <Session
          ids={[seeds[0].id, ...proposals.slice(0, 3).map(p => p.id)]}
          byId={byId}
          onDone={t => { setTrials(prev => [...prev, ...t]); setStep('profile') }}
        />
      )}
      {step === 'profile' && (
        <Profile all={all} trials={trials} onMore={propose} />
      )}
    </main>
  )
}

function SeedStep({ client, seeds, setSeeds, onNext }: { client: QlooClient; seeds: Entity[]; setSeeds: (s: Entity[]) => void; onNext: () => void }) {
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<Entity[]>([])
  return (
    <section>
      <h2>What do they already love?</h2>
      <p>Type a show, film or book they return to. Nothing about the child is sent to Qloo, only the title.</p>
      <PhotoSeed onTitles={async titles => {
        const found = (await Promise.all(titles.map(t => client.search(t).then(r => r[0]).catch(() => undefined)))).filter((e): e is Entity => !!e)
        setHits(found)
      }} />
      <form onSubmit={async e => { e.preventDefault(); setHits(await client.search(q)) }}>
        <input aria-label="Title" value={q} onChange={e => setQ(e.target.value)} placeholder="e.g. Thomas" />
        <button>Find</button>
      </form>
      <ul className="list">{hits.map(h => (
        <li key={h.id}><button className="link" onClick={() => !seeds.some(s => s.id === h.id) && setSeeds([...seeds, h])}>+ {h.name}</button></li>
      ))}</ul>
      <LastTime seeds={seeds} setSeeds={setSeeds} />
      {seeds.length > 0 && <p>Favourites: {seeds.map(s => s.name).join(', ')}</p>}
      <button className="secondary" onClick={onNext} disabled={!seeds.length}>Manual: show things to try</button>
    </section>
  )
}

function PhotoSeed({ onTitles }: { onTitles: (t: string[]) => Promise<void> }) {
  const [msg, setMsg] = useState<string>()
  return (
    <label className="photo">
      <span className="photo-btn">📷 Snap their shelf, toys or screen</span>
      <small>We read the titles from the photo. The photo is not stored.</small>
      <input className="visually-hidden" type="file" accept="image/*" capture="environment" onChange={async e => {
        const file = e.target.files?.[0]
        if (!file) return
        setMsg('Looking…')
        const data = await new Promise<string>(r => { const fr = new FileReader(); fr.onload = () => r(String(fr.result).split(',')[1]); fr.readAsDataURL(file) })
        const res = await fetch('/api/vision', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ mediaType: file.type, data }) }).catch(() => undefined)
        const body = await res?.json().catch(() => ({})) as { items?: { title: string }[]; error?: string } | undefined
        if (!res?.ok || !body?.items) { setMsg(body?.error ?? 'Photo detection unavailable — type titles instead'); return }
        setMsg(body.items.length ? `Found ${body.items.length}. Tap the ones that are right.` : 'Nothing recognised — type titles instead')
        await onTitles(body.items.map(i => i.title))
      }} />
      {msg && <small role="status">{msg}</small>}
    </label>
  )
}

function Session({ ids, byId, onDone }: { ids: string[]; byId: Map<string, Entity>; onDone: (t: Trial[]) => void }) {
  const schedule = useMemo(() => pairedSchedule(ids), [ids])
  const [i, setI] = useState(0)
  const [trials, setTrials] = useState<Trial[]>([])
  const [guess, setGuess] = useState<string>()
  const [chosen, setChosen] = useState<string | null>()
  const [reactions, setReactions] = useState<Reaction[]>([])
  const start = useRef(0)
  const [, tick] = useState(0)
  useEffect(() => {
    if (!chosen) return
    const t = setInterval(() => tick(n => n + 1), 500)
    return () => clearInterval(t)
  }, [chosen])

  const pair = schedule[i]
  function finishTrial() {
    const t: Trial = { shown: pair, chosen: chosen ?? null, carerGuess: guess, engagementMs: chosen ? Date.now() - start.current : 0, reactions }
    const next = [...trials, t]
    setGuess(undefined); setChosen(undefined); setReactions([])
    if (i + 1 >= schedule.length) onDone(next)
    else { setTrials(next); setI(i + 1) }
  }

  return (
    <section>
      <h2>Choice {i + 1} of {schedule.length}</h2>
      {!guess && <p><strong>Carer first:</strong> which one will they pick?</p>}
      {guess && chosen === undefined && <p>Now let them choose. Tap the one they reach for, look at, or ask for.</p>}
      <div className="cards">
        {pair.map(id => (
          <button key={id} className={`card ${chosen === id ? 'on' : ''}`} disabled={chosen !== undefined && chosen !== id}
            onClick={() => {
              if (!guess) setGuess(id)
              else if (chosen === undefined) { setChosen(id); start.current = Date.now() }
            }}>
            {byId.get(id)?.image && <img src={byId.get(id)!.image} alt="" />}
            {byId.get(id)?.name}
            {guess === id && <small>carer's guess</small>}
          </button>
        ))}
      </div>
      {guess && chosen === undefined && <button className="link" onClick={() => setChosen(null)}>No choice</button>}
      {chosen && (
        <>
          <p className="timer">Engaged: {Math.round((Date.now() - start.current) / 1000)}s</p>
          <div className="chips">{REACTIONS.map(r => (
            <button key={r} className={reactions.includes(r) ? 'on' : ''} onClick={() => setReactions(x => x.includes(r) ? x.filter(y => y !== r) : [...x, r])}>{r}</button>
          ))}</div>
        </>
      )}
      {chosen !== undefined && <button onClick={finishTrial}>{chosen ? 'He’s finished with it' : 'Next'}</button>}
    </section>
  )
}

function Profile({ all, trials, onMore }: { all: Entity[]; trials: Trial[]; onMore: () => void }) {
  const items = all.map(e => ({ id: e.id, title: e.name, source: 'qloo' as const }))
  const tags = Object.fromEntries(all.filter(e => score(trials).some(s => s.id === e.id && s.chosen > 0)).map(e => [e.id, e.tags]))
  const lines = buildProfile(items, trials, tags)
  const g = guessAccuracy(trials)
  const top = score(trials)[0]
  const seedIds = new Set(all.slice(0, 1).map(e => e.id))
  return (
    <section>
      {top && !seedIds.has(top.id) && top.chosen > 0 && <p className="win">New favourite found: {all.find(e => e.id === top.id)?.name}</p>}
      <h2>One-page profile</h2>
      <ul className="list">{lines.map((l, k) => <li key={k}><span className={`tag ${l.source}`}>{SOURCE_LABEL[l.source]}</span> {l.text}</li>)}</ul>
      <p>Carer guessed right {g.matched} of {g.total} times.</p>
      <button onClick={() => window.print()}>Print / save</button>{' '}
      <button onClick={onMore}>Find more to try</button>
    </section>
  )
}

/** Earlier sessions, read from this device only. */
function LastTime({ seeds, setSeeds }: { seeds: Entity[]; setSeeds: (s: Entity[]) => void }) {
  const [h, setH] = useState(loadHistory)
  if (!h.length) return null
  const favs = knownFavourites(h)
  const last = h[h.length - 1]
  return (
    <div className="last-time" aria-label="Last time">
      <p><strong>Last time</strong> ({new Date(last.date).toLocaleDateString()}, {h.length} session{h.length > 1 ? 's' : ''} on this device): {favs.map(f => f.name).join(', ') || 'no favourites yet'}</p>
      {favs.length > 0 && <button className="secondary" onClick={() => setSeeds([...seeds, ...favs.filter(f => !seeds.some(s => s.id === f.id)).slice(0, 5).map(f => (({ id: f.id, name: f.name, image: f.image, type: seeds[0]?.type ?? 'movie', tags: [] })))])}>Start from last session</button>}
      <button className="link" onClick={() => { forgetHistory(); setH([]) }}>Forget</button>
    </div>
  )
}
