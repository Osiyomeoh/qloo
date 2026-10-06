// Claude on AWS Bedrock. Server side only. Credentials: BEDROCK_ACCESS_KEY_ID/BEDROCK_SECRET_ACCESS_KEY
// with BEDROCK_REGION when set (needed on Vercel, which reserves the AWS_* names for its own
// runtime), otherwise the standard AWS chain (AWS_PROFILE, AWS_* keys, or an IAM role) locally.
// They are never sent to the browser or put in prompts.
import { AnthropicBedrock } from '@anthropic-ai/bedrock-sdk'

export type BedrockEnv = { AWS_REGION?: string; BEDROCK_REGION?: string; BEDROCK_ACCESS_KEY_ID?: string; BEDROCK_SECRET_ACCESS_KEY?: string; VERCEL?: string; BEDROCK_AGENT_MODEL?: string; BEDROCK_VISION_MODEL?: string }

// Bedrock model / inference-profile IDs. Overridable because IDs vary by region and account access.
export const DEFAULT_AGENT_MODEL = 'us.anthropic.claude-sonnet-4-6'
export const DEFAULT_VISION_MODEL = 'us.anthropic.claude-sonnet-4-6'

export type Create = (body: Record<string, unknown>) => Promise<{ content: any[]; stop_reason: string }>

// On Vercel, AWS_REGION and AWS keys belong to the platform, so only the BEDROCK_* names count there.
export const bedrockConfigured = (env: BedrockEnv) =>
  env.VERCEL ? Boolean(env.BEDROCK_REGION && env.BEDROCK_ACCESS_KEY_ID && env.BEDROCK_SECRET_ACCESS_KEY) : Boolean(env.BEDROCK_REGION || env.AWS_REGION)

/** Returns a function that sends one Messages request to Bedrock. */
export function bedrockCreate(env: BedrockEnv, timeoutMs = 60_000): Create {
  const awsRegion = env.BEDROCK_REGION || env.AWS_REGION
  const client = env.BEDROCK_ACCESS_KEY_ID && env.BEDROCK_SECRET_ACCESS_KEY
    ? new AnthropicBedrock({ awsRegion, awsAccessKey: env.BEDROCK_ACCESS_KEY_ID, awsSecretKey: env.BEDROCK_SECRET_ACCESS_KEY, timeout: timeoutMs, maxRetries: 1 })
    : new AnthropicBedrock({ awsRegion, timeout: timeoutMs, maxRetries: 1 })
  return async body => {
    try {
      return (await client.messages.create(body as any)) as any
    } catch (e: any) {
      throw new Error(`model error ${e?.status ?? 'no response'}`)
    }
  }
}
