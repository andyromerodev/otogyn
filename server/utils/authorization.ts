import type { H3Event } from 'h3'
import type { ServerAuthorizationAction } from '../../src/application/dto/server-auth'
import { serverAuthServiceLocator } from '../../src/infrastructure/auth/server-service-locator'
import type { SessionUserContext } from './get-current-user'
import { getCurrentUser } from './get-current-user'

export type AuthorizationAction = ServerAuthorizationAction

export const canPerformAction = (
  session: SessionUserContext,
  action: AuthorizationAction,
): boolean => serverAuthServiceLocator.authorizeServerActionUseCase.canPerformAction(session, action)

export const assertCanPerformAction = (
  session: SessionUserContext,
  action: AuthorizationAction,
): SessionUserContext =>
  serverAuthServiceLocator.authorizeServerActionUseCase.assertCanPerformAction(session, action)

export const requireAuthorizedUser = async (
  event: H3Event,
  action: AuthorizationAction,
): Promise<SessionUserContext> => {
  const session = await getCurrentUser(event)

  return assertCanPerformAction(session, action)
}
