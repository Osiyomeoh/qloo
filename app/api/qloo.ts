import { proxyQloo } from '../src/server/qlooProxy.js'
export async function GET(req: Request) { return proxyQloo(new URL(req.url), process.env.QLOO_API_KEY) }
