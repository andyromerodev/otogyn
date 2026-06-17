import type { H3Event } from 'h3'
import { serverAuthServiceLocator } from '../../src/infrastructure/auth/server-service-locator'
import type { ServerSessionContextDto } from '../../src/application/dto/server-auth'

export type SessionUserContext = ServerSessionContextDto

export const getCurrentUser = async (
  event?: H3Event,
  allowedRoles: Array<SessionUserContext['role']> = ['admin_doctor', 'assistant'],
): Promise<SessionUserContext> => {
  const session = await serverAuthServiceLocator.resolveServerSessionUseCase.execute({
    headers: event?.headers,
  })

  if (!allowedRoles.includes(session.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
  }

  return session
}
