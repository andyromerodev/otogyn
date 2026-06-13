import type { H3Event } from 'h3'
import { getBetterAuth, getOrganizationRoleForUser, isBetterAuthEnabled } from '../../src/infrastructure/auth/better-auth'
import { demoOrganization, demoUsers } from '../../src/infrastructure/mock/demo-data'

export interface SessionUserContext {
  userId: string
  organizationId: string
  role: 'admin_doctor' | 'assistant'
  email?: string
  name?: string
}

export const getCurrentUser = async (
  event?: H3Event,
  allowedRoles: Array<SessionUserContext['role']> = ['admin_doctor', 'assistant'],
): Promise<SessionUserContext> => {
  if (event && isBetterAuthEnabled()) {
    const auth = getBetterAuth()

    if (auth) {
      const session = await auth.api.getSession({
        headers: event.headers,
      })

      if (!session?.user) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Unauthorized',
        })
      }

      const membership = await getOrganizationRoleForUser(session.user.id)

      if (!membership) {
        throw createError({
          statusCode: 403,
          statusMessage: 'User has no organization role.',
        })
      }

      if (!allowedRoles.includes(membership.role as SessionUserContext['role'])) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Forbidden',
        })
      }

      return {
        userId: session.user.id,
        organizationId: membership.organizationId,
        role: membership.role as SessionUserContext['role'],
        email: session.user.email,
        name: session.user.name,
      }
    }
  }

  const defaultUser = demoUsers[0]

  if (!defaultUser) {
    throw createError({
      statusCode: 500,
      statusMessage: 'No mock users configured.',
    })
  }

  return {
    userId: defaultUser.id,
    organizationId: demoOrganization.id,
    role: defaultUser.role === 'patient_future' ? 'assistant' : defaultUser.role,
    email: defaultUser.email,
    name: defaultUser.name,
  }
}
