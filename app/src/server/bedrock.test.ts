import { describe, expect, it } from 'vitest'
import { bedrockConfigured } from './bedrock'

describe('bedrockConfigured', () => {
  it('locally accepts the standard AWS region', () => {
    expect(bedrockConfigured({ AWS_REGION: 'us-west-2' })).toBe(true)
    expect(bedrockConfigured({})).toBe(false)
  })
  it('on Vercel ignores the platform AWS_REGION and needs the BEDROCK_* trio', () => {
    expect(bedrockConfigured({ VERCEL: '1', AWS_REGION: 'us-east-1' })).toBe(false)
    expect(bedrockConfigured({ VERCEL: '1', BEDROCK_REGION: 'us-west-2', BEDROCK_ACCESS_KEY_ID: 'a' })).toBe(false)
    expect(bedrockConfigured({ VERCEL: '1', BEDROCK_REGION: 'us-west-2', BEDROCK_ACCESS_KEY_ID: 'a', BEDROCK_SECRET_ACCESS_KEY: 'b' })).toBe(true)
  })
})
