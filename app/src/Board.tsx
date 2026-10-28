// Their board: the things they chose, ready to say. Tap a picture and the device says "I want Chuggington",
// and the words show in large type for anyone without sound. Many PECS and AAC users ask for things with
// picture cards; this board is built from the person's own choices. Speech prefers a voice that
// runs on the device, so the words stay here too. It is a board of favourites, not a communication system.
import { useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { CardFace, type Card } from './AgentView'
import { sentence, speak } from './say'

export const BOARD_MAX = 6

/** Full screen, text-light, for the person to use themselves. */
export function Board({ cards, onClose }: { cards: Card[]; onClose: () => void }) {
  const [said, setSaid] = useState<string>()
  const [mute, setMute] = useState(false)
  const shown = cards.slice(0, BOARD_MAX)
  return createPortal(
    <div className="child board" role="dialog" aria-modal="true" aria-label="Their board">
      <p className="board-said" aria-live="polite">{said ?? (mute ? 'Tap a picture' : 'Tap a picture to say it')}</p>
      <div className={`child-cards n${shown.length}`}>
        {shown.map((c, k) => (
          <button key={c.id} style={{ '--i': k } as CSSProperties} className={`child-card ${said === sentence(c.name) ? 'picked' : ''}`}
            onClick={() => { const t = sentence(c.name); setMute(!speak(t)); setSaid(t) }}>
            <CardFace c={c} />
          </button>
        ))}
      </div>
      {mute && <p className="board-note">This device can't speak, so the words show above.</p>}
      <button className="link child-close" onClick={onClose}>Back to carer view</button>
    </div>,
    document.body,
  )
}

/** The same cards on paper, about 5 cm square, to cut out for a picture-card book. */
export function PrintCards({ cards }: { cards: Card[] }) {
  return <div className="print-cards" aria-hidden>{cards.map(c => <div key={c.id} className="print-card"><CardFace c={c} /></div>)}</div>
}
