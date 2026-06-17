import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMocks = vi.hoisted(() => ({
  getBetterAuth: vi.fn(),
  getOrganizationMembershipForUser: vi.fn(),
  isBetterAuthEnabled: vi.fn(),
}))

vi.mock('../../src/infrastructure/auth/better-auth', () => authMocks)
vi.mock('../../src/infrastructure/mock/demo-data', () => ({
  demoOrganization: { id: 'demo-org' },
  demoUsers: [{ id: 'demo-user', role: 'admin_doctor', email: 'demo@otogyn.test', name: 'Demo' }],
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

  it('returns the current active session user when membership is active', async () => {
    authMocks.isBetterAuthEnabled.mockReturnValue(true)
    authMocks.getBetterAuth.mockReturnValue({
      api: {
        getSession: vi.fn().mockResolvedValue({
          user: {
            id: 'user-1',
            email: 'ana@otogyn.test',
            name: 'Dra. Ana',
          },
        }),
      },
    })
    authMocks.getOrganizationMembershipForUser.mockResolvedValue({
      organizationId: 'org-1',
      role: 'admin_doctor',
      isActive: true,
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

  it('throws 403 when the user membership is deactivated', async () => {
    authMocks.isBetterAuthEnabled.mockReturnValue(true)
    authMocks.getBetterAuth.mockReturnValue({
      api: {
        getSession: vi.fn().mockResolvedValue({
          user: {
            id: 'user-2',
            email: 'assistant@otogyn.test',
            name: 'Asistente',
          },
        }),
      },
    })
    authMocks.getOrganizationMembershipForUser.mockResolvedValue({
      organizationId: 'org-1',
      role: 'assistant',
      isActive: false,
    })

    const { getCurrentUser } = await import('./get-current-user')

    await expect(getCurrentUser({ headers: {} } as never)).rejects.toMatchObject({
      statusCode: 403,
      statusMessage: 'User account is deactivated.',
    })
  })

  it('throws 403 when the user role is not allowed for the endpoint', async () => {
    authMocks.isBetterAuthEnabled.mockReturnValue(true)
    authMocks.getBetterAuth.mockReturnValue({
      api: {
        getSession: vi.fn().mockResolvedValue({
          user: {
            id: 'user-3',
            email: 'assistant@otogyn.test',
            name: 'Asistente',
          },
        }),
      },
    })
    authMocks.getOrganizationMembershipForUser.mockResolvedValue({
      organizationId: 'org-1',
      role: 'assistant',
      isActive: true,
    })

    const { getCurrentUser } = await import('./get-current-user')

    await expect(getCurrentUser({ headers: {} } as never, ['admin_doctor'])).rejects.toMatchObject({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
  })
})
