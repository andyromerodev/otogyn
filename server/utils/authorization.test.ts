import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SessionUserContext } from './get-current-user'
import { assertCanPerformAction, canPerformAction } from './authorization'

const getCurrentUserMock = vi.hoisted(() => vi.fn())
const canPerformActionMock = vi.hoisted(() => vi.fn())
const assertCanPerformActionMock = vi.hoisted(() => vi.fn())

vi.mock('./get-current-user', () => ({
  getCurrentUser: getCurrentUserMock,
}))

vi.mock('../../src/infrastructure/auth/server-service-locator', () => ({
  serverAuthServiceLocator: {
    authorizeServerActionUseCase: {
      canPerformAction: canPerformActionMock,
      assertCanPerformAction: assertCanPerformActionMock,
    },
  },
}))

describe('authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    ;(globalThis as {
      createError?: (input: { statusCode: number; statusMessage: string }) => Error & {
        statusCode: number
        statusMessage: string
      }
    }).createError = ({ statusCode, statusMessage }) =>
      Object.assign(new Error(statusMessage), {
        statusCode,
        statusMessage,
      })

    canPerformActionMock.mockImplementation(
      (session: SessionUserContext, action: string) =>
        !(
          session.role === 'assistant' &&
          (action === 'assistants:write' || action === 'services:write')
        ),
    )
    assertCanPerformActionMock.mockImplementation(
      (session: SessionUserContext, action: string) => {
        if (
          session.role === 'assistant' &&
          (action === 'assistants:write' || action === 'services:write')
        ) {
          throw Object.assign(new Error('Forbidden'), {
            statusCode: 403,
            statusMessage: 'Forbidden',
          })
        }

        return session
      },
    )
  })

  it('allows the doctor to manage assistants and services', () => {
    const session: SessionUserContext = {
      userId: 'doctor-1',
      organizationId: 'org-1',
      role: 'admin_doctor',
    }

    expect(canPerformAction(session, 'assistants:write')).toBe(true)
    expect(canPerformAction(session, 'services:write')).toBe(true)
  })

  it('blocks assistants from modifying assistants or services', () => {
    const session: SessionUserContext = {
      userId: 'assistant-1',
      organizationId: 'org-1',
      role: 'assistant',
    }

    expect(canPerformAction(session, 'assistants:write')).toBe(false)
    expect(canPerformAction(session, 'services:write')).toBe(false)
    expect(canPerformAction(session, 'patients:write')).toBe(true)
    expect(canPerformAction(session, 'appointments:create')).toBe(true)
    expect(canPerformAction(session, 'appointments:update')).toBe(true)
    expect(canPerformAction(session, 'appointments:cancel')).toBe(true)
    expect(canPerformAction(session, 'appointments:status')).toBe(true)
  })

  it('throws forbidden when the action is not allowed for the role', () => {
    const session: SessionUserContext = {
      userId: 'assistant-1',
      organizationId: 'org-1',
      role: 'assistant',
    }

    expect(() => assertCanPerformAction(session, 'assistants:write')).toThrowError('Forbidden')
  })

  it('resolves the current user and applies permissions in requireAuthorizedUser', async () => {
    getCurrentUserMock.mockResolvedValue({
      userId: 'assistant-1',
      organizationId: 'org-1',
      role: 'assistant',
    } satisfies SessionUserContext)

    const { requireAuthorizedUser } = await import('./authorization')

    await expect(requireAuthorizedUser({} as never, 'patients:write')).resolves.toEqual({
      userId: 'assistant-1',
      organizationId: 'org-1',
      role: 'assistant',
    })

    await expect(requireAuthorizedUser({} as never, 'services:write')).rejects.toMatchObject({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
  })
})
