import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { sql } from 'drizzle-orm'
import { getDrizzleClient } from '../../src/infrastructure/database/drizzle/client'

type PublicSecurityAction = 'booking' | 'pre_evaluation' | 'pre_evaluation_upload'

type PublicRateLimitBucket =
  | 'public-token'
  | 'public-services'
  | 'public-slots'
  | 'public-booking'
  | 'public-pre-evaluation'
  | 'public-pre-evaluation-upload'

interface RateLimitConfig {
  max: number
  windowMs: number
}

interface LocalRateLimitEntry {
  count: number
  resetAt: number
}

const TOKEN_TTL_MS = 30 * 60 * 1000
const TOKEN_FUTURE_SKEW_MS = 60 * 1000
const TOKEN_PARTS = 4

const localRateLimitStore = new Map<string, LocalRateLimitEntry>()

const PUBLIC_RATE_LIMITS: Record<PublicRateLimitBucket, RateLimitConfig> = {
  'public-token': { max: 20, windowMs: 60_000 },
  'public-services': { max: 60, windowMs: 60_000 },
  'public-slots': { max: 30, windowMs: 60_000 },
  'public-booking': { max: 5, windowMs: 10 * 60_000 },
  'public-pre-evaluation': { max: 3, windowMs: 10 * 60_000 },
  'public-pre-evaluation-upload': { max: 8, windowMs: 10 * 60_000 },
}

function getPublicSecuritySecret(): string {
  const secret = process.env.PUBLIC_FORM_SECRET ?? process.env.AUTH_SECRET

  if (secret) return secret

  if (process.env.NODE_ENV !== 'production') {
    return 'dev-only-public-form-secret'
  }

  throw createError({
    statusCode: 500,
    statusMessage: 'Public form security is not configured.',
  })
}

function base64Url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')
}

function signTokenPayload(action: PublicSecurityAction, issuedAt: number, nonce: string): string {
  return base64Url(
    createHmac('sha256', getPublicSecuritySecret())
      .update(`${action}.${issuedAt}.${nonce}`)
      .digest(),
  )
}

function getClientIp(event: Parameters<typeof getRequestIP>[0]): string {
  return getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ?? getRequestIP(event) ?? 'unknown'
}

function getClientKey(event: Parameters<typeof getRequestIP>[0], bucket: PublicRateLimitBucket): string {
  const ip = getClientIp(event)
  const userAgent = getHeader(event, 'user-agent') ?? 'unknown'
  const digest = createHash('sha256')
    .update(`${getPublicSecuritySecret()}:${ip}:${userAgent}`)
    .digest('hex')
    .slice(0, 64)

  return `${bucket}:${digest}`
}

function getRateLimitRow(result: unknown): { count: number, reset_at: Date | string } | null {
  if (Array.isArray(result)) {
    return result[0] as { count: number, reset_at: Date | string } | undefined ?? null
  }

  const rows = (result as { rows?: unknown[] })?.rows
  return (rows?.[0] as { count: number, reset_at: Date | string } | undefined) ?? null
}

function enforceLocalRateLimit(key: string, config: RateLimitConfig): void {
  const now = Date.now()
  const entry = localRateLimitStore.get(key)

  if (!entry || now >= entry.resetAt) {
    localRateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs })
    return
  }

  entry.count += 1

  if (entry.count > config.max) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests. Please try again later.',
    })
  }
}

export function createPublicSecurityToken(action: PublicSecurityAction): string {
  const issuedAt = Date.now()
  const nonce = base64Url(randomBytes(18))
  const signature = signTokenPayload(action, issuedAt, nonce)

  return `${action}.${issuedAt}.${nonce}.${signature}`
}

export function validatePublicSecurityToken(token: string | null | undefined, action: PublicSecurityAction): void {
  if (!token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid public form request.',
    })
  }

  const parts = token.split('.')
  if (parts.length !== TOKEN_PARTS) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid public form request.',
    })
  }

  const [tokenAction, issuedAtText, nonce, signature] = parts as [string, string, string, string]
  const issuedAt = Number(issuedAtText)

  const tokenAge = Date.now() - issuedAt
  if (
    tokenAction !== action ||
    !Number.isFinite(issuedAt) ||
    tokenAge > TOKEN_TTL_MS ||
    tokenAge < -TOKEN_FUTURE_SKEW_MS
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid public form request.',
    })
  }

  const expected = signTokenPayload(action, issuedAt, nonce)
  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid public form request.',
    })
  }
}

export function validatePublicHoneypot(value: unknown): void {
  if (typeof value === 'string' && value.trim().length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid public form request.',
    })
  }
}

export async function enforcePublicRateLimit(
  event: Parameters<typeof getRequestIP>[0],
  bucket: PublicRateLimitBucket,
): Promise<void> {
  const config = PUBLIC_RATE_LIMITS[bucket]
  const key = getClientKey(event, bucket)
  const resetAt = new Date(Date.now() + config.windowMs)

  try {
    const db = getDrizzleClient()
    const result = await db.execute(sql`
      INSERT INTO public_rate_limits ("key", "count", "reset_at", "updated_at")
      VALUES (${key}, 1, ${resetAt}, now())
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN public_rate_limits."reset_at" <= now() THEN 1
          ELSE public_rate_limits."count" + 1
        END,
        "reset_at" = CASE
          WHEN public_rate_limits."reset_at" <= now() THEN ${resetAt}
          ELSE public_rate_limits."reset_at"
        END,
        "updated_at" = now()
      RETURNING "count", "reset_at"
    `)

    const row = getRateLimitRow(result)
    if (!row) return

    if (row.count > config.max) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many requests. Please try again later.',
      })
    }

    if (Math.random() < 0.01) {
      await db.execute(sql`DELETE FROM public_rate_limits WHERE "reset_at" < now()`)
    }
  } catch (error) {
    if ((error as { statusCode?: number })?.statusCode === 429) {
      throw error
    }

    console.warn('Persistent public rate limit unavailable; using local fallback.')
    enforceLocalRateLimit(key, config)
  }
}
