import { afterEach, describe, expect, it } from 'vitest'
import { registerRequestScopeResolver, type RequestScope } from '../../src/infrastructure/runtime/request-scope'
import { serverServiceLocator } from './server-service-locator'

const FAKE_CONNECTION_STRING = 'postgres://test-user:test-password@localhost:5432/otogyn_test'

const createFakeScope = (): RequestScope => ({
  env: { HYPERDRIVE: { connectionString: FAKE_CONNECTION_STRING } },
  cache: new Map(),
  waitUntil: () => {},
  onRequestEnd: () => {},
})

describe('serverServiceLocator', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL

  afterEach(() => {
    registerRequestScopeResolver(() => null)

    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl
    }
  })

  it('keeps one service container for Node', () => {
    process.env.DATABASE_URL = FAKE_CONNECTION_STRING
    registerRequestScopeResolver(() => null)

    expect(serverServiceLocator.patients.listPatientsUseCase).toBe(
      serverServiceLocator.patients.listPatientsUseCase,
    )
  })

  it('fails attachment access on Workers when the ATTACHMENTS binding is missing', async () => {
    registerRequestScopeResolver(() => createFakeScope())

    await expect(serverServiceLocator.preEvaluationForms.attachmentStorage.get('any.pdf')).rejects.toThrow(
      'R2 binding ATTACHMENTS is not configured.',
    )
  })

  it('builds a new service container for each Workers request', () => {
    let activeScope = createFakeScope()
    registerRequestScopeResolver(() => activeScope)

    const firstRequestUseCase = serverServiceLocator.patients.listPatientsUseCase

    expect(serverServiceLocator.patients.listPatientsUseCase).toBe(firstRequestUseCase)

    activeScope = createFakeScope()

    expect(serverServiceLocator.patients.listPatientsUseCase).not.toBe(firstRequestUseCase)
  })
})
