import { useState, type CSSProperties } from 'react'
import { nextArray, rankMswo, MSWO_ROUNDS, type MswoTrial } from './core/mswo'
import { saveMswo } from './core/history'
import { CardFace, ChildScreen, type Card } from './AgentView'

/** Runs a standard MSWO assessment on the session's items, then shows the preference hierarchy. */
export function MswoAssessment({ items }: { items: Card[] }) {
  const [on, setOn] = useState(false)
  const [trials, setTrials] = useState<MswoTrial[]>([])
  const [show, setShow] = useState(false)
  const ids = items.map(i => i.id)
  const next = on ? nextArray(ids, trials) : null
  const byId = new Map(items.map(i => [i.id, i]))
  const record = (chosen: string | null) => {
    const t = [...trials, { ...next!, chosen }]
    setTrials(t)
    if (!nextArray(ids, t)) saveMswo(rankMswo(t).map(r => ({ id: r.id, name: byId.get(r.id)?.name ?? r.id, pct: r.pct, rank: r.rank })))
  }

  if (!on) return (
    <div className="mswo">
      <h3>Confirm with a preference assessment</h3>
      <p className="src">A standard method (MSWO): all {items.length} are shown together; the one chosen is removed and the rest are shown again, {MSWO_ROUNDS} rounds. Takes a few minutes.</p>
      <button className="secondary" onClick={() => setOn(true)}>Start assessment</button>
    </div>
  )
  if (next) return (
    <div className="mswo" aria-label="Assessment">
      <p><strong>Round {next.round + 1} of {MSWO_ROUNDS}</strong> · {next.array.length} left. Which did they choose?</p>
      <div className="options" key={trials.length}>{next.array.map((id, k) => <button key={id} style={{ '--i': k } as CSSProperties} className="option" onClick={() => record(id)}><CardFace c={byId.get(id)!} /></button>)}</div>
      <p><button className="secondary" onClick={() => setShow(true)}>Show to child, full screen</button> <button className="link" onClick={() => record(null)}>No choice (ends this round)</button></p>
      {show && <ChildScreen cards={next.array.map(id => byId.get(id)!)} onPick={record} onClose={() => setShow(false)} />}
    </div>
  )
  const ranks = rankMswo(trials)
  return (
    <div className="mswo" aria-label="Preference hierarchy">
      <h3>Preference hierarchy</h3>
      <table>
        <thead><tr><th>Rank</th><th>Item</th><th>Chosen</th><th>Selection</th></tr></thead>
        <tbody>{ranks.map((r, k) => (
          <tr key={r.id} style={{ '--i': k } as CSSProperties}><td>{r.rank}</td><td>{byId.get(r.id)?.name ?? r.id}</td><td>{r.chosen} of {r.available}</td><td className="pct"><span className="meter" style={{ width: `${(r.pct * 48) / 100}px` }} /> {r.pct}%</td></tr>
        ))}</tbody>
      </table>
      <p className="src">Selection % = times chosen ÷ times it was on offer, over {trials.length} trials. One assessment is a snapshot: repeat across days before relying on it. Saved on this device.</p>
    </div>
  )
}
