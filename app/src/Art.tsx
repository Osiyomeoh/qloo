import type { CSSProperties, ReactNode } from 'react'

/* Decorative art. Every piece is aria-hidden and carries no text, so it never changes what a screen reader
   (or a test) reads. Motion is CSS only and is switched off by prefers-reduced-motion in index.css. */

type Vars = CSSProperties & Record<`--${string}`, string | number>

const GLYPHS: Record<string, ReactNode> = {
  train: <><rect x="9" y="7" width="5" height="8" rx="1.5" /><rect x="4" y="14" width="22" height="13" rx="3" /><rect x="20" y="8" width="14" height="19" rx="3" /><rect x="23.5" y="11" width="7" height="6" rx="1.5" fill="#fff" fillOpacity=".85" /><circle cx="11" cy="30" r="4.2" /><circle cx="27" cy="30" r="4.2" /><circle cx="11" cy="30" r="1.6" fill="#fff" /><circle cx="27" cy="30" r="1.6" fill="#fff" /></>,
  moon: <><path d="M25 6a14 14 0 1 0 9 24A12 12 0 0 1 25 6z" /><path d="M31 9l1.2 2.6 2.8.4-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.4z" /></>,
  book: <><path d="M5 10c5.5-2.5 11-1.5 14.5 2v21c-3.5-3.5-9-4.5-14.5-2z" /><path d="M35 10c-5.5-2.5-11-1.5-14.5 2v21c3.5-3.5 9-4.5 14.5-2z" fillOpacity=".7" /></>,
  note: <><circle cx="12" cy="29" r="5.5" /><circle cx="29" cy="25.5" r="5.5" /><path d="M16.5 29V11l17-4v18.5" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" /></>,
  heart: <path d="M20 34S7 26 7 16.5A7.5 7.5 0 0 1 20 11.6 7.5 7.5 0 0 1 33 16.5C33 26 20 34 20 34z" />,
}
const Glyph = ({ k }: { k: string }) => <svg className={`ic ic-${k}`} viewBox="0 0 40 40" focusable="false">{GLYPHS[k]}</svg>

/** Over the start-screen photo, the method in two pieces: two things offered and one chosen, and what
 *  they choose collecting in their speech bubble. Plays once on load, then rests. */
export function ChoiceOverlay() {
  return (
    <div className="co" aria-hidden>
      <div className="co-cards">
        <span className="co-card other"><Glyph k="moon" /><i /></span>
        <span className="co-card pick"><Glyph k="train" /><i /><b className="co-heart"><Glyph k="heart" /></b></span>
      </div>
      <div className="co-bubble">
        {['train', 'book', 'note'].map((k, i) => <span key={k} className="co-tok" style={{ '--i': i } as Vars}><Glyph k={k} /></span>)}
      </div>
    </div>
  )
}

/** Soft shapes that bloom out of whatever was just chosen. Decorative, no flashing. */
export function Burst({ n = 12 }: { n?: number }) {
  return (
    <span className="burst" aria-hidden>
      {Array.from({ length: n }, (_, k) => <i key={k} style={{ '--a': `${(360 / n) * k + (k % 2) * 9}deg`, '--m': k % 3 === 0 ? 1 : k % 3 === 1 ? 0.72 : 0.86 } as Vars} />)}
    </span>
  )
}

/** A speech bubble with a heart: "this is what they said, by choosing". */
export function VoiceMark({ className = '' }: { className?: string }) {
  return (
    <svg className={`voice-mark ${className}`} viewBox="0 0 64 56" aria-hidden focusable="false">
      <path className="vm-bubble" pathLength={1} d="M12 4h40a8 8 0 0 1 8 8v22a8 8 0 0 1-8 8H26l-12 10 3-10h-5a8 8 0 0 1-8-8V12a8 8 0 0 1 8-8z" />
      <path className="vm-heart" d="M32 34s-9-5.4-9-11.6a4.9 4.9 0 0 1 9-2.7 4.9 4.9 0 0 1 9 2.7C41 28.6 32 34 32 34z" />
    </svg>
  )
}

const ICONS: Record<string, string> = {
  smile: 'M8 14.5a4.5 4.5 0 0 0 8 0',
  laugh: 'M7.5 13.5h9a4.5 4.5 0 0 1-9 0z',
  reach: 'M12 19V6m0 0-4.5 4.5M12 6l4.5 4.5',
  vocalise: 'M8 9.5v5M12 7v10M16 9.5v5',
  'look-away': 'M3.5 12s3-5.5 8.5-5.5 8.5 5.5 8.5 5.5-3 5.5-8.5 5.5S3.5 12 3.5 12zM5 19 19 5',
  'push-away': 'M5 12h12m0 0-4.5-4.5M17 12l-4.5 4.5M20 6v12',
  distress: 'M8.5 16a4.5 4.5 0 0 1 7 0M8.5 9.5l2 1M15.5 9.5l-2 1',
}
const FACE = new Set(['smile', 'laugh', 'distress'])
/** Small line icon for a logged reaction. */
export function ReactionIcon({ r }: { r: string }) {
  return (
    <svg className="r-icon" viewBox="0 0 24 24" aria-hidden focusable="false">
      {FACE.has(r) && <circle cx="12" cy="12" r="8.5" />}
      {(r === 'smile' || r === 'laugh') && <><circle cx="9" cy="10" r=".9" className="dot" /><circle cx="15" cy="10" r=".9" className="dot" /></>}
      <path d={ICONS[r] ?? ''} />
    </svg>
  )
}
export const POSITIVE = new Set(['smile', 'laugh', 'reach', 'vocalise'])
