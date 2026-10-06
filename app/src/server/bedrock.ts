// Claude on AWS Bedrock. Server side only. Credentials come from the standard AWS chain
// (AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY[/AWS_SESSION_TOKEN], AWS_PROFILE, or an IAM role);
// they are never sent to the browser or put in prompts.
import { AnthropicBedrock } from '@anthropic-ai/bedrock-sdk'

export type BedrockEnv = { AWS_REGION?: string; BEDROCK_AGENT_MODEL?: string; BEDROCK_VISION_MODEL?: string }

// Bedrock model / inference-profile IDs. Overridable because IDs vary by region and account access.
export const DEFAULT_AGENT_MODEL = 'us.anthropic.claude-opus-5-5-v1:0'
export const DEFAULT_VISION_MODEL = 'us.anthropic.claude-sonnet-5-5-v1:0'

export type Create = (body: Record<string, unknown>) => Promise<{ content: any[]; stop_reason: string }>

export const bedrockConfigured = (env: BedrockEnv) => Boolean(env.AWS_REGION)

/** Returns a function that sends one Messages request to Bedrock. */
export function bedrockCreate(env: BedrockEnv, timeoutMs = 60_000): Create {
  const client = new AnthropicBedrock({ awsRegion: env.AWS_REGION, timeout: timeoutMs, maxRetries: 1 })
  return async body => {
    try {
      return (await client.messages.create(body as any)) as any
    } catch (e: any) {
      throw new Error(`model error ${e?.status ?? 'no response'}`)
    }
  }
}
