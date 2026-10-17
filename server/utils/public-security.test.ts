import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enforceWorkersRateLimit } from './public-security'

type RateLimitEvent = Parameters<typeof enforceWorkersRateLimit>[0]

// public-security.ts usa auto-imports de Nitro (createError, getHeader, getRequestIP).
// Fuera de Nitro no existen, asi que se sustituyen por versiones minimas.
const installNitroGlobals = () => {
  const globals = globalThis as Record<string, unknown>

  globals.createError = ({ statusCode, statusMessage }: { statusCode: number; statusMessage: string }) =>
    Object.assign(new Error(statusMessage), { statusCode, statusMessage })
  globals.getHeader = (event: { headers: Record<string, string> }, name: string) => event.headers[name]
  globals.getRequestIP = () => '203.0.113.10'
}

const createWorkersEvent = (env: Record<string, unknown>): RateLimitEvent =>
  ({ context: { cloudflare: { env } }, headers: {} }) as unknown as RateLimitEvent

const createNodeEvent = (): RateLimitEvent =>
  ({ context: {}, headers: {} }) as unknown as RateLimitEvent

const limiterReturning = (success: boolean) => ({
  limit: vi.fn(async () => ({ success })),
})

describe('enforceWorkersRateLimit', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    installNitroGlobals()
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('warns and falls through to the database limiter when the GET binding is missing', async () => {
    await expect(
      enforceWorkersRateLimit(createWorkersEvent({}), 'GET', '/api/public/services'),
    ).resolves.toBeUndefined()

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('PUBLIC_GET_LIMITER'))
  })

  it('warns and falls through to the database limiter when the limiter throws', async () => {
    const limiter = {
      limit: vi.fn(async () => {
        throw new Error('limiter unavailable')
      }),
    }

    await expect(
      enforceWorkersRateLimit(
        createWorkersEvent({ PUBLIC_POST_LIMITER: limiter }),
        'POST',
        '/api/public/booking',
      ),
    ).resolves.toBeUndefined()

    expect(limiter.limit).toHaveBeenCalledTimes(1)
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('rate limiter failed'), expect.any(Error))
  })

  it('still answers 429 when the limiter denies the request', async () => {
    const limiter = limiterReturning(false)

    await expect(
      enforceWorkersRateLimit(createWorkersEvent({ PUBLIC_GET_LIMITER: limiter }), 'GET', '/api/public/slots'),
    ).rejects.toMatchObject({ statusCode: 429 })
  })

  it('does nothing and stays silent outside Workers', async () => {
    await expect(
      enforceWorkersRateLimit(createNodeEvent(), 'GET', '/api/public/services'),
    ).resolves.toBeUndefined()

    expect(warnSpy).not.toHaveBeenCalled()
  })
})
