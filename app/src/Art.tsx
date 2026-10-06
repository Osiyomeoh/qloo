import type { CSSProperties } from 'react'

/* Decorative art. Every piece is aria-hidden and carries no text, so it never changes what a screen reader
   (or a test) reads. Motion is CSS only and is switched off by prefers-reduced-motion in index.css. */

type Vars = CSSProperties & Record<`--${string}`, string | number>

/** The idea in one loop: two things are offered, the child taps one, and that choice goes into their
 *  speech bubble. Three choices fill the bubble, then they become a one-page profile. */
export function HeroArt() {
  const scenes = [
    { pick: 'train', other: 'moon', side: 0 },
    { pick: 'book', other: 'ball', side: 1 },
    { pick: 'note', other: 'fish', side: 0 },
  ]
  const cardX = [36, 164], slotX = [350, 405, 460], slotY = 79
  return (
    <svg className="hero-art" viewBox="0 0 520 300" aria-hidden focusable="false">
      <defs>
        <symbol id="ha-train" viewBox="0 0 40 40"><rect x="9" y="7" width="5" height="8" rx="1.5" /><rect x="4" y="14" width="22" height="13" rx="3" /><rect x="20" y="8" width="14" height="19" rx="3" /><rect x="23.5" y="11" width="7" height="6" rx="1.5" fill="#fff" fillOpacity=".85" /><circle cx="11" cy="30" r="4.2" /><circle cx="27" cy="30" r="4.2" /><circle cx="11" cy="30" r="1.6" fill="#fff" /><circle cx="27" cy="30" r="1.6" fill="#fff" /></symbol>
        <symbol id="ha-moon" viewBox="0 0 40 40"><path d="M25 6a14 14 0 1 0 9 24A12 12 0 0 1 25 6z" /><path d="M31 9l1.2 2.6 2.8.4-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.4z" /></symbol>
        <symbol id="ha-ball" viewBox="0 0 40 40"><circle cx="20" cy="20" r="14" /><path d="M7 16c8 5 18 5 26 0M9 27c7-4 15-4 22 0" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="2.4" strokeLinecap="round" /></symbol>
        <symbol id="ha-book" viewBox="0 0 40 40"><path d="M5 10c5.5-2.5 11-1.5 14.5 2v21c-3.5-3.5-9-4.5-14.5-2z" /><path d="M35 10c-5.5-2.5-11-1.5-14.5 2v21c3.5-3.5 9-4.5 14.5-2z" fillOpacity=".7" /></symbol>
        <symbol id="ha-note" viewBox="0 0 40 40"><circle cx="12" cy="29" r="5.5" /><circle cx="29" cy="25.5" r="5.5" /><path d="M16.5 29V11l17-4v18.5" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" /></symbol>
        <symbol id="ha-fish" viewBox="0 0 40 40"><ellipse cx="17" cy="20" rx="12.5" ry="8.5" /><path d="M27 20l9-8v16z" /><circle cx="11" cy="18" r="2" fill="#fff" /></symbol>
        <symbol id="ha-heart" viewBox="0 0 40 40"><path d="M20 34S7 26 7 16.5A7.5 7.5 0 0 1 20 11.6 7.5 7.5 0 0 1 33 16.5C33 26 20 34 20 34z" /></symbol>
      </defs>

      <g className="ha-blobs">
        <path className="ha-blob a" d="M120 40c70-30 170-10 190 60s-30 150-120 170S20 250 20 170 50 70 120 40z" />
        <path className="ha-blob b" d="M380 150c60-10 120 30 120 80s-60 70-120 60-90-40-80-80 20-50 80-60z" />
      </g>
      <g className="ha-float">
        <circle className="f1" cx="28" cy="58" r="5" /><circle className="f2" cx="268" cy="34" r="3.5" />
        <rect className="f3" x="494" y="196" width="10" height="10" rx="3" /><circle className="f4" cx="290" cy="270" r="4" />
        <path className="f5" d="M250 120l2.4 5.6 5.6 2.4-5.6 2.4-2.4 5.6-2.4-5.6-5.6-2.4 5.6-2.4z" />
      </g>

      {/* the child, whose voice is the bubble above them */}
      <g className="ha-child">
        <path className="ha-body" d="M364 300c0-36 21-58 48-58s48 22 48 58z" />
        <g className="ha-head">
          <circle className="ha-face" cx="412" cy="210" r="23" />
          <path className="ha-hair" d="M389 208a23 23 0 0 1 46-3c-6-8-15-11-24-9-7 1-13 5-17 10-2 1-4 2-5 2z" />
          <circle className="ha-cheek" cx="399" cy="218" r="4" /><circle className="ha-cheek" cx="423" cy="218" r="4" />
          <g className="ha-eyes"><circle cx="404" cy="210" r="2.3" /><circle cx="417" cy="210" r="2.3" /></g>
          <path className="ha-smile" d="M405 219q5.5 4.5 11 0" />
        </g>
      </g>

      {/* their voice: a speech bubble that fills with what they choose */}
      <g className="ha-voice">
        <path className="ha-bubble" d="M322 22h156a22 22 0 0 1 22 22v70a22 22 0 0 1-22 22h-52l-14 24-10-24h-80a22 22 0 0 1-22-22V44a22 22 0 0 1 22-22z" />
        {slotX.map(x => <circle key={x} className="ha-slot" cx={x} cy={slotY} r="21" />)}
        {scenes.map((s, k) => (
          <g key={s.pick} transform={`translate(${slotX[k]} ${slotY})`}>
            <g className={`ha-tok t${k}`} style={{ '--dx': `${cardX[s.side] + 52 - slotX[k]}px`, '--dy': `${212 - slotY}px` } as Vars}>
              <circle r="21" className="ha-tok-bg" /><use href={`#ha-${s.pick}`} className={`ic ic-${s.pick}`} x="-14" y="-14" width="28" height="28" />
            </g>
          </g>
        ))}
        <g transform="translate(486 30)"><g className="ha-heart"><use href="#ha-heart" className="ic ic-heart" x="-15" y="-15" width="30" height="30" /></g></g>
      </g>

      {/* three choices, one after another */}
      {scenes.map((s, k) => (
        <g key={s.pick} className={`ha-scene s${k}`} style={{ '--t': `${k * 3.6}s` } as Vars}>
          {[0, 1].map(side => {
            const icon = side === s.side ? s.pick : s.other, chosen = side === s.side
            return (
              <g key={side} transform={`translate(${cardX[side]} 150)`}>
                <g className="ha-deal" style={{ '--r': side ? '7deg' : '-7deg', '--d': `${side * 0.1}s` } as Vars}>
                  <g className={chosen ? 'ha-pick' : 'ha-recede'}>
                    {chosen && <rect className="ha-ring" x="-6" y="-6" width="116" height="136" rx="21" />}
                    <rect className="ha-card" width="104" height="124" rx="16" />
                    <use href={`#ha-${icon}`} className={`ic ic-${icon}`} x="20" y="16" width="64" height="64" />
                    <rect className="ha-label" x="22" y="94" width="60" height="8" rx="4" />
                  </g>
                  {chosen && <>
                    <circle className="ha-ripple" cx="52" cy="62" r="12" />
                    <circle className="ha-tap" cx="52" cy="62" r="11" />
                  </>}
                </g>
              </g>
            )
          })}
        </g>
      ))}

      {/* …and the choices become a one-page profile */}
      <g transform="translate(46 156)">
        <g className="ha-profile">
          <rect className="ha-card" width="222" height="118" rx="18" />
          <rect className="ha-title" x="18" y="18" width="84" height="10" rx="5" />
          <use href="#ha-heart" className="ic ic-heart" x="184" y="12" width="22" height="22" />
          {scenes.map((s, k) => (
            <g key={s.pick} transform={`translate(${18 + k * 66} 42)`}>
              <rect className="ha-mini" width="54" height="54" rx="12" />
              <use href={`#ha-${s.pick}`} className={`ic ic-${s.pick}`} x="9" y="9" width="36" height="36" />
            </g>
          ))}
        </g>
      </g>
    </svg>
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
