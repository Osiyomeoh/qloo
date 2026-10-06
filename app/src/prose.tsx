import type { ReactNode } from 'react'

// The agent writes light markdown (lists, **bold**, *italics*). Render that much, as React text, never as HTML.

/** Bold and italics inside one line; any other asterisks are dropped. */
export function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g).filter(Boolean).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4 ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part.startsWith('*') && part.endsWith('*') && part.length > 2 ? <em key={i}>{part.slice(1, -1)}</em>
        : part.replace(/\*/g, ''))
}

/** Paragraphs and bullet or numbered lists; headings become bold lines. */
export function prose(text: string): ReactNode[] {
  const out: ReactNode[] = []
  let list: { ordered: boolean; items: string[] } | undefined
  const flush = () => {
    if (!list) return
    const items = list.items.map((x, i) => <li key={i}>{inline(x)}</li>)
    out.push(list.ordered ? <ol key={out.length}>{items}</ol> : <ul key={out.length}>{items}</ul>)
    list = undefined
  }
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    const item = /^(?:([-*•])|(\d+)[.)])\s+(.*)$/.exec(line)
    if (item) {
      const ordered = !!item[2]
      if (list && list.ordered !== ordered) flush()
      list ??= { ordered, items: [] }
      list.items.push(item[3])
      continue
    }
    flush()
    if (!line) continue
    const h = /^#+\s*(.*)$/.exec(line)
    out.push(<p key={out.length}>{h ? <strong>{inline(h[1])}</strong> : inline(line)}</p>)
  }
  flush()
  return out
}
