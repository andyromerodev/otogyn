import { beforeEach, describe, expect, it, vi } from 'vitest'

const resolveServerSessionMock = vi.hoisted(() => vi.fn())

vi.mock('../../src/infrastructure/auth/server-service-locator', () => ({
  serverAuthServiceLocator: {
    resolveServerSessionUseCase: {
      execute: resolveServerSessionMock,
    },
  },
}))

describe('getCurrentUser', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()

    ;(globalThis as { createError?: (input: { statusCode: number; statusMessage: string }) => Error & { statusCode: number; statusMessage: string } }).createError =
      ({ statusCode, statusMessage }) =>
        Object.assign(new Error(statusMessage), {
          statusCode,
          statusMessage,
        })
  })

  it('returns the resolved active session user when the role is allowed', async () => {
    resolveServerSessionMock.mockResolvedValue({
      userId: 'user-1',
      organizationId: 'org-1',
      role: 'admin_doctor',
      email: 'ana@otogyn.test',
      name: 'Dra. Ana',
    })

    const { getCurrentUser } = await import('./get-current-user')

    await expect(getCurrentUser({ headers: {} } as never, ['admin_doctor'])).resolves.toEqual({
      userId: 'user-1',
      organizationId: 'org-1',
      role: 'admin_doctor',
      email: 'ana@otogyn.test',
      name: 'Dra. Ana',
    })
  })

  it('propagates repository session errors such as deactivated membership', async () => {
    resolveServerSessionMock.mockRejectedValue(
      Object.assign(new Error('User account is deactivated.'), {
        statusCode: 403,
        statusMessage: 'User account is deactivated.',
      }),
    )

    const { getCurrentUser } = await import('./get-current-user')

    await expect(getCurrentUser({ headers: {} } as never)).rejects.toMatchObject({
      statusCode: 403,
      statusMessage: 'User account is deactivated.',
    })
  })

  it('throws 403 when the user role is not allowed for the endpoint', async () => {
    resolveServerSessionMock.mockResolvedValue({
      userId: 'user-3',
      organizationId: 'org-1',
      role: 'assistant',
      email: 'assistant@otogyn.test',
      name: 'Asistente',
    })

    const { getCurrentUser } = await import('./get-current-user')

    await expect(getCurrentUser({ headers: {} } as never, ['admin_doctor'])).rejects.toMatchObject({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
  })
})
