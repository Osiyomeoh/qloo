// Dev only: serves api/<name>.ts at /api/<name> the way Vercel does (web Request in, Response
// out, exported GET/POST), so `npm run dev` runs the whole app locally, keys staying server side.
// Env comes from the dev server's process (e.g. `npx vite` after loading .env, see README).
import type { Plugin, ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'

async function toRequest(req: IncomingMessage): Promise<Request> {
  const chunks: Buffer[] = []
  for await (const c of req) chunks.push(c as Buffer)
  const body = chunks.length ? Buffer.concat(chunks) : undefined
  const headers = new Headers()
  for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v)
  return new Request(`http://localhost${req.url}`, { method: req.method, headers, ...(body && req.method !== 'GET' ? { body } : {}) })
}

export function devApi(): Plugin {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res: ServerResponse, next) => {
        const m = req.url?.match(/^\/api\/([a-z-]+)(?:\?|$)/)
        if (!m) return next()
        try {
          const mod = await server.ssrLoadModule(`/api/${m[1]}.ts`)
          const handler = mod[req.method ?? 'GET']
          if (typeof handler !== 'function') { res.statusCode = 405; return res.end() }
          const out: Response = await handler(await toRequest(req))
          res.statusCode = out.status
          out.headers.forEach((v, k) => res.setHeader(k, v))
          res.end(Buffer.from(await out.arrayBuffer()))
        } catch (e) {
          if ((e as Error).message?.includes('Failed to load url')) return next()
          res.statusCode = 500
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ error: (e as Error).message }))
        }
      })
    },
  }
}
