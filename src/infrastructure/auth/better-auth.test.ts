import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { registerRequestScopeResolver, type RequestScope } from '../runtime/request-scope'
import { getBetterAuth, isBetterAuthEnabled } from './better-auth'

// Valores ficticios para pruebas: no hay conexion real hasta la primera query.
const FAKE_CONNECTION_STRING = 'postgres://test-user:test-password@localhost:5432/otogyn_test'
const FAKE_AUTH_SECRET = 'unit-test-auth-secret-not-for-production'

const createFakeScope = (): RequestScope => ({
  env: { HYPERDRIVE: { connectionString: FAKE_CONNECTION_STRING } },
  cache: new Map(),
  waitUntil: () => {},
  onRequestEnd: () => {},
})

describe('getBetterAuth', () => {
  const originalEnv = {
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
  }

  const restoreEnv = (name: 'DATABASE_URL' | 'AUTH_SECRET') => {
    const value = originalEnv[name]

    if (value === undefined) {
      delete process.env[name]
    } else {
      process.env[name] = value
    }
  }

  beforeEach(() => {
    process.env.DATABASE_URL = FAKE_CONNECTION_STRING
    process.env.AUTH_SECRET = FAKE_AUTH_SECRET
    registerRequestScopeResolver(() => null)
  })

  afterEach(() => {
    registerRequestScopeResolver(() => null)
    restoreEnv('DATABASE_URL')
    restoreEnv('AUTH_SECRET')
  })

  it('is disabled without an auth secret', () => {
    delete process.env.AUTH_SECRET

    expect(isBetterAuthEnabled()).toBe(false)
    expect(getBetterAuth()).toBeNull()
  })

  it('keeps one Better Auth instance on Node', () => {
    expect(getBetterAuth()).not.toBeNull()
    expect(getBetterAuth()).toBe(getBetterAuth())
  })

  it('enables auth on Workers with Hyperdrive and no DATABASE_URL', () => {
    delete process.env.DATABASE_URL
    registerRequestScopeResolver(() => createFakeScope())

    expect(isBetterAuthEnabled()).toBe(true)
    expect(getBetterAuth()).not.toBeNull()
  })

  it('creates a Better Auth instance per Workers request', () => {
    let activeScope = createFakeScope()
    registerRequestScopeResolver(() => activeScope)

    const firstRequestAuth = getBetterAuth()

    expect(getBetterAuth()).toBe(firstRequestAuth)

    activeScope = createFakeScope()

    expect(getBetterAuth()).not.toBe(firstRequestAuth)
  })
})
