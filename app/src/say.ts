// Helpers for their board (Board.tsx): the sentence, speaking it, and printing the picture cards.

export const sentence = (name: string) => `I want ${name}`

/** Say it out loud with the browser's own speech. Returns false when this device can't speak. */
export function speak(text: string): boolean {
  const s = globalThis.speechSynthesis
  if (!s || typeof SpeechSynthesisUtterance === 'undefined') return false
  const u = new SpeechSynthesisUtterance(text)
  const voices = s.getVoices().filter(v => v.localService)
  const voice = voices.find(v => v.default) ?? voices.find(v => v.lang.startsWith('en'))
  if (voice) u.voice = voice
  u.rate = 0.9
  s.cancel()
  s.speak(u)
  return true
}

/** Print only the picture cards, then put the page back. */
export function printCards() {
  document.body.dataset.print = 'cards'
  const done = () => { delete document.body.dataset.print; window.removeEventListener('afterprint', done) }
  window.addEventListener('afterprint', done)
  window.print()
}
