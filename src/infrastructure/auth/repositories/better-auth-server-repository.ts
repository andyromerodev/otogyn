import type {
  ServerAuthRequestContextDto,
  ServerSessionContextDto,
} from '../../../application/dto/server-auth'
import type { ServerAuthRepository } from '../../../domain/repositories/server-auth-repository'
import {
  getBetterAuth,
  getOrganizationMembershipForUser,
  isBetterAuthEnabled,
} from '../better-auth'
import { demoOrganization, demoUsers } from '../../mock/demo-data'

export class BetterAuthServerRepository implements ServerAuthRepository {
  async resolveSession(input: ServerAuthRequestContextDto): Promise<ServerSessionContextDto> {
    if (isBetterAuthEnabled()) {
      const auth = getBetterAuth()

      if (auth) {
        const session = await auth.api.getSession({
          headers: input.headers ?? {},
        })

        if (!session?.user) {
          throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
          })
        }

        const membership = await getOrganizationMembershipForUser(session.user.id)

        if (!membership) {
          throw createError({
            statusCode: 403,
            statusMessage: 'User has no organization role.',
          })
        }

        if (!membership.isActive) {
          throw createError({
            statusCode: 403,
            statusMessage: 'User account is deactivated.',
          })
        }

        return {
          userId: session.user.id,
          organizationId: membership.organizationId,
          role: membership.role as ServerSessionContextDto['role'],
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
}

