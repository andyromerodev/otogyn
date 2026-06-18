interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  POST: { max: 10, windowMs: 60_000 },
  GET: { max: 60, windowMs: 60_000 },
}

function getIp(event: Parameters<typeof getRequestIP>[0]): string {
  return getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ?? getRequestIP(event) ?? 'unknown'
}

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  if (!url.pathname.startsWith('/api/public/')) return

  const method = getMethod(event)
  const limit = LIMITS[method] ?? LIMITS.GET!
  const ip = getIp(event)
  const key = `${method}:${ip}`
  const now = Date.now()

  const entry = store.get(key)

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + limit.windowMs })
    return
  }

  entry.count++

  if (entry.count > limit.max) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests. Please try again later.',
    })
  }
})
