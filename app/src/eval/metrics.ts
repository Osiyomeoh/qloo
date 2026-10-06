// Pure scoring for our reproducible measurements. No clinical meaning.

export const norm = (s: string) =>
  s.normalize('NFKC').toLowerCase().replace(/&/g, 'and').replace(/[^\p{L}\p{N}]+/gu, ' ').replace(/\b(the|a|an)\b/g, ' ').replace(/\s+/g, ' ').trim()

/** Detection vs labels: a label is found if any detected title normalises to it, or one contains the other. */
export function matchTitles(labels: string[], detected: string[]) {
  const d = detected.map(norm)
  const hit = (l: string) => { const n = norm(l); return d.some(x => x === n || (x.length > 3 && n.includes(x)) || (n.length > 3 && x.includes(n))) }
  const found = labels.filter(hit)
  const extra = detected.filter(x => !labels.some(l => { const n = norm(l), y = norm(x); return n === y || n.includes(y) || y.includes(n) }))
  return { labels: labels.length, found: found.length, missed: labels.filter(l => !hit(l)), extra }
}

export function summarisePhotos(rows: { labels: number; found: number; extra: string[]; resolved?: number }[]) {
  const labels = rows.reduce((a, r) => a + r.labels, 0)
  const found = rows.reduce((a, r) => a + r.found, 0)
  const extra = rows.reduce((a, r) => a + r.extra.length, 0)
  const resolved = rows.reduce((a, r) => a + (r.resolved ?? 0), 0)
  return {
    photos: rows.length, labels, found, extra, resolved,
    recallPct: pct(found, labels),
    precisionPct: pct(found, found + extra),
    resolvedOfFoundPct: pct(resolved, found),
  }
}

/** Benchmark: one list of proposals scored against Qloo search resolution. */
export interface Proposal { title: string; resolvedId?: string; popularity?: number; tags?: string[] }

export function scoreProposals(seedTags: string[], props: Proposal[]) {
  const seed = new Set(seedTags.map(norm))
  const resolved = props.filter(p => p.resolvedId)
  const pops = resolved.map(p => p.popularity).filter((x): x is number => typeof x === 'number').sort((a, b) => a - b)
  const overlaps = resolved.filter(p => p.tags?.length).map(p => p.tags!.filter(t => seed.has(norm(t))).length / p.tags!.length)
  return {
    n: props.length,
    unresolvedPct: pct(props.length - resolved.length, props.length),
    medianPopularity: pops.length ? pops[Math.floor(pops.length / 2)] : null,
    meanSeedTagOverlapPct: overlaps.length ? Math.round((100 * overlaps.reduce((a, b) => a + b, 0)) / overlaps.length) : null,
    distinct: new Set(props.map(p => norm(p.title))).size,
  }
}

const pct = (a: number, b: number) => (b ? Math.round((100 * a) / b) : 0)
