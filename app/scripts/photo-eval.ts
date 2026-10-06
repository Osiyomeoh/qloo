// Usage: AWS_REGION=… (+ AWS credentials) [QLOO_API_KEY=…] npm run eval:photos
import { bedrockCreate, DEFAULT_VISION_MODEL } from '../src/server/bedrock.js'
// Reads eval/photos/labels.json: [{ "file": "shelf1.jpg", "items": ["Cars", "Bluey"] }]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { extname, join } from 'node:path'
import { detectItems } from '../src/server/vision.js'
import { matchTitles, summarisePhotos } from '../src/eval/metrics.js'
import { need, resolve, stamp } from './lib.js'

const dir = 'eval/photos'
const labels = JSON.parse(readFileSync(join(dir, 'labels.json'), 'utf8')) as { file: string; items: string[] }[]
need('AWS_REGION')
const vision = bedrockCreate(process.env, 30_000)
const qlooKey = process.env.QLOO_API_KEY
const types: Record<string, string> = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }

const rows = []
for (const { file, items } of labels) {
  const data = readFileSync(join(dir, file)).toString('base64')
  const res = await detectItems({ mediaType: types[extname(file).toLowerCase()] ?? '', data }, vision, process.env.BEDROCK_VISION_MODEL || DEFAULT_VISION_MODEL)
  const body = await res.json() as { items?: { title: string }[]; error?: string }
  if (!res.ok) { console.error(file, body.error); continue }
  const detected = body.items!.map(i => i.title)
  const m = matchTitles(items, detected)
  let resolved: number | undefined
  if (qlooKey) {
    const found = items.filter(l => !m.missed.includes(l))
    resolved = (await Promise.all(found.map(t => resolve(t, qlooKey).catch(() => undefined)))).filter(Boolean).length
  }
  rows.push({ file, ...m, detected, resolved })
  console.log(`${file}: found ${m.found}/${m.labels}, extra ${m.extra.length}${resolved !== undefined ? `, resolved in Qloo ${resolved}` : ''}`)
}
const summary = summarisePhotos(rows)
console.log(summary)
mkdirSync('eval/results', { recursive: true })
const out = `eval/results/photos-${stamp()}.json`
writeFileSync(out, JSON.stringify({ summary, rows, qloo: !!qlooKey }, null, 2))
console.log('saved', out)
