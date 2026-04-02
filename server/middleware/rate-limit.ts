interface RateLimitEntry {
  count: number
  resetAt: number
}

const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute
const CLEANUP_INTERVAL_MS = 300_000 // 5 minutes

const store = new Map<string, RateLimitEntry>()

// Periodically clean up expired entries to prevent memory leaks
let lastCleanup = Date.now()

function cleanup(): void {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key)
    }
  }
}

// Public routes subject to rate limiting
const RATE_LIMITED_PATHS = [
  '/api/contact',
  '/api/newsletter',
  '/api/check-email',
  '/api/send-confirmation',
]

function getClientIp(event: any): string {
  const forwarded = getHeader(event, 'x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = getHeader(event, 'x-real-ip')
  if (realIp) {
    return realIp
  }
  return 'unknown'
}

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname

  // Only rate-limit specific public routes
  if (!RATE_LIMITED_PATHS.some(p => path.startsWith(p))) {
    return
  }

  // Only rate-limit POST requests (not GET)
  const method = getMethod(event)
  if (method !== 'POST') {
    return
  }

  cleanup()

  const ip = getClientIp(event)
  const key = `${ip}:${path}`
  const now = Date.now()

  const entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000)
    setResponseHeader(event, 'Retry-After', retryAfterSeconds)
    throw createError({
      statusCode: 429,
      message: 'Trop de requetes. Reessayez dans quelques instants.',
    })
  }

  store.set(key, { ...entry, count: entry.count + 1 })
})
