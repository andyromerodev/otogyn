import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { registerRequestScopeResolver, type RequestScope } from '../../runtime/request-scope'
import { getDrizzleClient, type DrizzleClient } from './client'

// Cadena ficticia: postgres.js no abre conexion hasta la primera query.
const FAKE_CONNECTION_STRING = 'postgres://test-user:test-password@localhost:5432/otogyn_test'

type FakeScope = RequestScope & { cleanups: Array<() => unknown> }

const createFakeScope = (env: Record<string, unknown> = {}): FakeScope => {
  const cleanups: Array<() => unknown> = []

  return {
    env,
    cache: new Map(),
    waitUntil: () => {},
    onRequestEnd: (cleanup) => {
      cleanups.push(cleanup)
    },
    cleanups,
  }
}

const clientOptionsOf = (db: DrizzleClient) =>
  (db as unknown as { $client: { options: { prepare: boolean; max: number } } }).$client.options

describe('getDrizzleClient', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL

  beforeEach(() => {
    process.env.DATABASE_URL = FAKE_CONNECTION_STRING
  })

  afterEach(() => {
    registerRequestScopeResolver(() => null)

    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl
    }
  })

  it('reuses the Node singleton when there is no request scope', () => {
    registerRequestScopeResolver(() => null)

    expect(getDrizzleClient()).toBe(getDrizzleClient())
    expect(clientOptionsOf(getDrizzleClient()).prepare).toBe(false)
  })

  it('throws on Node when DATABASE_URL is missing', () => {
    registerRequestScopeResolver(() => null)
    delete process.env.DATABASE_URL

    expect(() => getDrizzleClient()).toThrow('DATABASE_URL no esta configurado.')
  })

  it('creates a separate client for each Workers request', () => {
    const first = createFakeScope({ HYPERDRIVE: { connectionString: FAKE_CONNECTION_STRING } })
    const second = createFakeScope({ HYPERDRIVE: { connectionString: FAKE_CONNECTION_STRING } })
    let activeScope: RequestScope = first
    registerRequestScopeResolver(() => activeScope)

    const firstDb = getDrizzleClient()
    expect(getDrizzleClient()).toBe(firstDb)

    activeScope = second
    const secondDb = getDrizzleClient()

    expect(secondDb).not.toBe(firstDb)
    expect(first.cleanups).toHaveLength(1)
    expect(second.cleanups).toHaveLength(1)
  })

  it('uses prepared statements with a small pool on Workers', () => {
    const scope = createFakeScope({ HYPERDRIVE: { connectionString: FAKE_CONNECTION_STRING } })
    registerRequestScopeResolver(() => scope)

    const options = clientOptionsOf(getDrizzleClient())

    expect(options.prepare).toBe(true)
    expect(options.max).toBe(5)
  })

  it('falls back to DATABASE_URL per request when Hyperdrive is not bound', () => {
    const scope = createFakeScope()
    registerRequestScopeResolver(() => scope)

    expect(clientOptionsOf(getDrizzleClient()).prepare).toBe(true)
  })

  it('throws on Workers when neither Hyperdrive nor DATABASE_URL is available', () => {
    const scope = createFakeScope()
    registerRequestScopeResolver(() => scope)
    delete process.env.DATABASE_URL

    expect(() => getDrizzleClient()).toThrow('DATABASE_URL no esta configurado.')
  })
})
