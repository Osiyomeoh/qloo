import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { SampleClient, KID_RATINGS, type Entity, type QlooClient } from './qloo/client'
import { pairedSchedule, score, guessAccuracy, nextSignals, type Reaction, type Trial } from './core/session'
import { buildProfile, SOURCE_LABEL } from './core/profile'
import { AgentView, Tally, type AgentTransport } from './AgentView'
import { loadHistory, forgetHistory, knownFavourites, mswoSeries, type SessionRecord } from './core/history'
import { Burst, HeroArt, POSITIVE, ReactionIcon } from './Art'

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
    <>
      <nav className="topbar">
        <span className="brand"><Logo />{APP_NAME}</span>
        {client.mode === 'sample'
          ? <p className="badge" role="status">Sample data — not live Qloo results</p>
          : <span className="pill">No account · no names · sessions stay on this device</span>}
      </nav>
      <main className={step === 'seed' ? 'home' : 'work'}>
      {step === 'seed' && <div className="hero">
        <header className="hero-copy">
          <p className="eyebrow">For carers of non-speaking children</p>
          <h1>Find what they love, <em>by letting them choose.</em></h1>
          <p className="pitch">An agent picks a few things to show, you log which one they reach for, and it learns from every choice.</p>
        </header>
        <HeroArt />
        <div className="panel">
          <SeedStep client={client} seeds={seeds} setSeeds={setSeeds} />
          <label className="notes">Anything the agent should know? (optional, no names)
            <input aria-label="Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. no loud audio; manages 2 cards" />
          </label>
          <button className="primary" onClick={() => setStep('agent')} disabled={!seeds.length}>Let the agent run a session</button>
          <button className="link manual" onClick={propose} disabled={!seeds.length}>Manual: show things to try</button>
        </div>
        <div className="hero-more">
          <ol className="how"><li><b>1</b><span>Name one thing they already love</span></li><li><b>2</b><span>The agent picks 2–4 things to show</span></li><li><b>3</b><span>Their choices become a one-page profile</span></li></ol>
          <ul className="trust">
            <li><TrustIcon d="M7 11V8a5 5 0 0 1 10 0v3M5.5 11h13v9h-13z" /><strong>Only titles go to Qloo</strong>Nothing about the child is sent, only the name of a show, film or book.</li>
            <li><TrustIcon d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-.5a6 6 0 0 1-5-2.7L4 14.5a1.5 1.5 0 0 1 2.5-1.7L9 15" /><strong>Chosen, not guessed</strong>A favourite only counts when the child picked it.</li>
            <li><TrustIcon d="M8 4.5h8M9 3h6v3H9zM6 4.5H5v16h14v-16h-1M8.5 13l2.5 2.5 4.5-5" /><strong>A standard method</strong>Confirm with MSWO, a published preference assessment.</li>
          </ul>
        </div>
      </div>}
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
    </>
  )
}

/** Two cards, one chosen: the whole method in a mark. */
function Logo() {
  return <svg className="logo" viewBox="0 0 32 32" aria-hidden><rect width="32" height="32" rx="9" fill="var(--accent)" /><rect className="lg-other" x="6" y="9" width="9" height="14" rx="2.5" fill="#fff" opacity=".45" /><rect className="lg-pick" x="17" y="7" width="9" height="16" rx="2.5" fill="#fff" /><circle className="lg-dot" cx="21.5" cy="26" r="1.6" fill="#fff" /></svg>
}

const TrustIcon = ({ d }: { d: string }) => <svg className="trust-icon" viewBox="0 0 24 24" aria-hidden><path d={d} /></svg>

function SeedStep({ client, seeds, setSeeds }: { client: QlooClient; seeds: Entity[]; setSeeds: (s: Entity[]) => void }) {
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<Entity[]>([])
  return (
    <section className="seed">
      <h2>What do they already love?</h2>
      <p className="hint">Type a show, film or book they return to. Nothing about the child is sent to Qloo, only the title.</p>
      <form className="search" onSubmit={async e => { e.preventDefault(); setHits(await client.search(q)) }}>
        <input aria-label="Title" value={q} onChange={e => setQ(e.target.value)} placeholder="e.g. Thomas" />
        <button>Find</button>
      </form>
      {hits.length > 0 && <ul className="hits">{hits.map((h, k) => (
        <li key={h.id} style={{ '--i': k } as CSSProperties}><button className={`hit${seeds.some(s => s.id === h.id) ? ' added' : ''}`} onClick={() => !seeds.some(s => s.id === h.id) && setSeeds([...seeds, h])}>+ {h.name}</button></li>
      ))}</ul>}
      {seeds.length > 0 && <p key={seeds.length} className="favs">Favourites: {seeds.map(s => s.name).join(', ')}</p>}
      <PhotoSeed onTitles={async titles => {
        const found = (await Promise.all(titles.map(t => client.search(t).then(r => r[0]).catch(() => undefined)))).filter((e): e is Entity => !!e)
        setHits(found)
      }} />
      <LastTime seeds={seeds} setSeeds={setSeeds} />
    </section>
  )
}

function PhotoSeed({ onTitles }: { onTitles: (t: string[]) => Promise<void> }) {
  const [msg, setMsg] = useState<string>()
  return (
    <label className="photo">
      <span className="photo-icon" aria-hidden><svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg></span>
      <span><span className="photo-btn">Or snap their shelf, toys or screen</span>
      <small>We read the titles from the photo. The photo is not stored.</small></span>
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
      <Tally trials={trials} total={schedule.length} name={id => byId.get(id)?.name ?? id} />
      {!guess && <p><strong>Carer first:</strong> which one will they pick?</p>}
      {guess && chosen === undefined && <p>Now let them choose. Tap the one they reach for, look at, or ask for.</p>}
      <div className="cards">
        {pair.map((id, k) => (
          <button key={`${i}-${id}`} style={{ '--i': k } as CSSProperties} className={`card ${chosen === id ? 'on' : ''}`} disabled={chosen !== undefined && chosen !== id}
            onClick={() => {
              if (!guess) setGuess(id)
              else if (chosen === undefined) { setChosen(id); start.current = Date.now() }
            }}>
            {byId.get(id)?.image && <img src={byId.get(id)!.image} alt="" />}
            {byId.get(id)?.name}
            {guess === id && <small>carer's guess</small>}
            {chosen === id && <Burst />}
          </button>
        ))}
      </div>
      {guess && chosen === undefined && <button className="link" onClick={() => setChosen(null)}>No choice</button>}
      {chosen && (
        <>
          <p className="timer"><span className="beat" aria-hidden />Engaged: {Math.round((Date.now() - start.current) / 1000)}s</p>
          <div className="chips">{REACTIONS.map(r => (
            <button key={r} data-tone={POSITIVE.has(r) ? 'up' : 'down'} className={reactions.includes(r) ? 'on' : ''} onClick={() => setReactions(x => x.includes(r) ? x.filter(y => y !== r) : [...x, r])}><ReactionIcon r={r} />{r}</button>
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
      {top && !seedIds.has(top.id) && top.chosen > 0 && <p className="win"><Burst n={14} />New favourite found: {all.find(e => e.id === top.id)?.name}</p>}
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
      <Trend h={h} />
    </div>
  )
}

const LINE = ['#c2410c', '#0f766e', '#7c3aed', '#2563eb', '#be185d', '#65a30d']
/** Selection % per item across assessed sessions. Only measured points are drawn; gaps stay gaps. */
export function Trend({ h }: { h: SessionRecord[] }) {
  const { dates, items } = mswoSeries(h)
  if (!dates.length) return null
  const top = items.sort((a, b) => (b.pcts.at(-1) ?? -1) - (a.pcts.at(-1) ?? -1)).slice(0, 6)
  const W = 320, H = 120, x = (i: number) => (dates.length === 1 ? (W + 34) / 2 : 44 + (i * (W - 54)) / (dates.length - 1)), y = (p: number) => H - 10 - (p * (H - 20)) / 100
  const label = top.map(it => `${it.name}: ${it.pcts.map(p => (p === null ? '–' : `${p}%`)).join(' → ')}`).join('; ')
  return (
    <figure className="trend-fig">
      <figcaption>Preference assessments over time ({dates.length})</figcaption>
      <svg className="trend" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        {[0, 50, 100].map(v => <g key={v}><line x1="34" x2={W} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity=".15" strokeDasharray="4 4" /><text x="0" y={y(v) + 4} fontSize="10" fill="currentColor" opacity=".6">{v}%</text></g>)}
        {top.map((it, k) => {
          const pts = it.pcts.map((p, i) => (p === null ? null : [x(i), y(p)] as const)).filter(Boolean) as (readonly [number, number])[]
          return <g key={it.id} stroke={LINE[k]} fill={LINE[k]}>
            {pts.length > 1 && <polyline className="trend-line" pathLength={1} fill="none" strokeWidth="2" points={pts.map(p => p.join(',')).join(' ')} />}
            {pts.map(([a, b], i) => <circle key={i} className="trend-pt" style={{ '--i': i } as CSSProperties} cx={a} cy={b} r="3.5" />)}
          </g>
        })}
      </svg>
      {dates.length === 1 && <p className="src">One assessment so far. Run another on a later day to see a trend.</p>}
      <ul className="legend">{top.map((it, k) => <li key={it.id}><span style={{ background: LINE[k] }} />{it.name} {it.pcts.at(-1) == null ? 'not in the last one' : `${it.pcts.at(-1)}%`}</li>)}</ul>
    </figure>
  )
}
