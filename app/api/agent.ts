import { handleAgent } from '../src/server/agentHandler.js'
export async function POST(req: Request) { return handleAgent(await req.text(), process.env) }
