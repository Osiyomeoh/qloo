import { detectItems } from '../src/server/vision.js'
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { mediaType?: unknown; data?: unknown } | null
  return detectItems({ mediaType: String(body?.mediaType ?? ''), data: String(body?.data ?? '') }, process.env.ANTHROPIC_API_KEY)
}
