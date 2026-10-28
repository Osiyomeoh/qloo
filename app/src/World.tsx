import type { CSSProperties, ReactNode } from 'react'
import { STATUS_LABEL, type Status, type WorldNode } from './core/world'

const ORDER: Status[] = ['again', 'once', 'not-yet', 'unseen']
const short = (s: string, n = 16) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)

/** The interest map: favourites in the middle, Qloo-related items around them. Lines are Qloo's (labelled with the
 *  tag they share); colour is the person's (only choices change it). */
export function Universe({ nodes }: { nodes: WorldNode[] }) {
  const seeds = nodes.filter(n => n.seed), rest = nodes.filter(n => !n.seed)
  const W = 520, H = 360, cx = W / 2, cy = H / 2, R = 132
  const pos = new Map<string, [number, number]>()
  seeds.forEach((n, i) => pos.set(n.id, seeds.length === 1 ? [cx, cy] : [cx + 34 * Math.cos((2 * Math.PI * i) / seeds.length), cy + 34 * Math.sin((2 * Math.PI * i) / seeds.length)]))
  rest.forEach((n, i) => { const a = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(rest.length, 1); pos.set(n.id, [cx + R * 1.45 * Math.cos(a), cy + R * Math.sin(a)]) })
  const label = nodes.map(n => `${n.name}: ${STATUS_LABEL[n.status]}${n.link ? `, linked by Qloo tag ${n.link}` : ''}`).join('; ')
  return (
    <figure className="universe">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Their world. ${label}`}>
        {rest.map(n => { const [x, y] = pos.get(n.id)!; const [sx, sy] = seeds[0] ? pos.get(seeds[0].id)! : [cx, cy]
          return <g key={`l-${n.id}`} className={`u-link ${n.link ? 'tagged' : ''}`}>
            <line x1={sx} y1={sy} x2={x} y2={y} />
            {n.link && <text x={Math.abs(x - sx) < 4 ? sx + 8 : sx + (x - sx) * .62} y={Math.abs(x - sx) < 4 ? sy + (y - sy) * .55 : sy + (y - sy) * .62 - 5} textAnchor={Math.abs(x - sx) < 4 ? 'start' : 'middle'}>{short(n.link, 18)}</text>}
          </g> })}
        {nodes.map((n, i) => { const [x, y] = pos.get(n.id)!
          return <g key={n.id} className={`u-node s-${n.status} ${n.seed ? 'seed' : ''}`} style={{ '--i': i } as CSSProperties} transform={`translate(${x} ${y})`}>
            {(() => { const r = n.seed ? 36 : 20 + Math.min(n.chosen, 4) * 4
              return <>
                <clipPath id={`u-c-${i}`}><circle r={r} /></clipPath>
                <circle r={r} />
                {n.image && <image href={n.image} x={-r} y={-r} width={2 * r} height={2 * r} preserveAspectRatio="xMidYMid slice" clipPath={`url(#u-c-${i})`} className={n.status === 'not-yet' || n.status === 'unseen' ? 'faded' : ''} />}
                <circle className="u-ring" r={r} />
                {n.chosen > 0 && <g className="u-badge" transform={`translate(${r * .72} ${-r * .72})`}><circle r="10" /><text dy="4" textAnchor="middle">{n.chosen}</text></g>}
                <text className="u-name" dy={r + 16} textAnchor="middle">{short(n.name)}</text>
              </>
            })()}
          </g> })}
      </svg>
      <figcaption>
        <ul className="u-key">{ORDER.map(s => <li key={s}><i className={`s-${s}`} />{STATUS_LABEL[s]}</li>)}</ul>
        <p className="src">Lines and their labels come from Qloo: tags an item shares with their favourite. Colour and size come only from what they chose. A line is a reason to try something, not proof they'll like it.</p>
      </figcaption>
    </figure>
  )
}

function Thumb({ n }: { n: WorldNode }) {
  return n.image ? <img className={`pp-thumb s-${n.status}`} src={n.image} alt="" /> : <span className={`pp-thumb s-${n.status}`} aria-hidden="true">{n.name.slice(0, 1)}</span>
}

function Sec({ t, items, empty }: { t: string; items: ReactNode[]; empty: string }) {
  return <section className="pp-sec"><h3>{t}</h3>{items.length ? <ul>{items}</ul> : <p className="pp-empty">{empty}</p>}</section>
}

/** One printable page a carer can hand to a teacher or therapist. Only recorded choices, with dates and counts. */
export function Passport({ nodes, date, children }: { nodes: WorldNode[]; date: string; children: ReactNode }) {
  const chose = nodes.filter(n => n.chosen > 0).sort((a, b) => b.chosen - a.chosen)
  const back = nodes.filter(n => n.sessions + (n.chosen > 0 ? 1 : 0) >= 2)
  const exploring = nodes.filter(n => n.status === 'not-yet' || n.status === 'unseen')
  const upset = nodes.filter(n => n.upset)
  return (
    <article className="passport" aria-label="Preference passport">
      <header><p className="eyebrow">One-page profile</p><h2>Meet me through my choices</h2><p className="src">Recorded {date}. Each line is something I picked when given a choice, not a guess about how I feel.</p></header>
      <div className="pp-grid">
        <Sec t="Things I chose" items={chose.map(n => <li key={n.id}><Thumb n={n} /><b>{n.name}</b> <span>{n.chosen} of {n.shown} times</span></li>)} empty="No choices yet this time." />
        <Sec t="Things I keep coming back to" items={back.map(n => <li key={n.id}><Thumb n={n} /><b>{n.name}</b> <span>chosen in {n.sessions + (n.chosen > 0 ? 1 : 0)} sessions</span></li>)} empty="Needs another session on a later day." />
        <Sec t="Still exploring" items={exploring.map(n => <li key={n.id}><Thumb n={n} /><b>{n.name}</b> <span>{n.shown ? `shown ${n.shown}, not picked yet` : 'not tried yet'}</span></li>)} empty="Everything on the map has been tried." />
        {upset.length > 0 && <Sec t="Went less well this time" items={upset.map(n => <li key={n.id}><Thumb n={n} /><b>{n.name}</b> <span>pushed away or upset once; try again another day</span></li>)} empty="" />}
      </div>
      <section className="pp-sec pp-how"><h3>How we learned this</h3>{children}</section>
    </article>
  )
}
