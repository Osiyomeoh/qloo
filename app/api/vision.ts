import { detectItems } from '../src/server/vision.js'
import { bedrockConfigured, bedrockCreate, DEFAULT_VISION_MODEL } from '../src/server/bedrock.js'
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { mediaType?: unknown; data?: unknown } | null
  const env = process.env
  return detectItems({ mediaType: String(body?.mediaType ?? ''), data: String(body?.data ?? '') },
    bedrockConfigured(env) ? bedrockCreate(env, 30_000) : undefined, env.BEDROCK_VISION_MODEL || DEFAULT_VISION_MODEL)
}
