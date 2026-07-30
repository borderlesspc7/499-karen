import { HttpsError } from 'firebase-functions/v2/https'
import { warn } from './logger'

export type RateLimitConfig = {
  limit: number
  windowMs: number
}

type AssertRateLimitInput = RateLimitConfig & {
  key: string
}

const ONE_MINUTE_MS = 60_000
const requestTimestampsByKey = new Map<string, number[]>()

export const RATE_LIMIT_PRESETS = {
  sendMessage: { limit: 30, windowMs: ONE_MINUTE_MS },
  ai: { limit: 20, windowMs: ONE_MINUTE_MS },
  oauth: { limit: 10, windowMs: ONE_MINUTE_MS },
  checkout: { limit: 10, windowMs: ONE_MINUTE_MS },
} as const satisfies Record<string, RateLimitConfig>

export function assertRateLimit({ key, limit, windowMs }: AssertRateLimitInput): void {
  const now = Date.now()
  const windowStart = now - windowMs
  const recentTimestamps = (requestTimestampsByKey.get(key) ?? []).filter(
    (timestamp) => timestamp > windowStart,
  )

  if (recentTimestamps.length >= limit) {
    const retryAfterMs = Math.max(1, recentTimestamps[0] + windowMs - now)
    requestTimestampsByKey.set(key, recentTimestamps)
    warn('Rate limit exceeded', { key, limit, windowMs, retryAfterMs })
    throw new HttpsError(
      'resource-exhausted',
      'Muitas solicitações. Aguarde antes de tentar novamente.',
      { retryAfterMs },
    )
  }

  requestTimestampsByKey.set(key, [...recentTimestamps, now])
}
