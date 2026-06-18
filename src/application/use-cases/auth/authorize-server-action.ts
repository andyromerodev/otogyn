import type {
  ServerAuthorizationAction,
  ServerSessionContextDto,
} from '../../dto/server-auth'

const permissionMatrix: Record<ServerSessionContextDto['role'], ServerAuthorizationAction[]> = {
  admin_doctor: [
    'session:read',
    'dashboard:read',
    'patients:read',
    'patients:write',
    'appointments:read',
    'appointments:create',
    'appointments:update',
    'appointments:cancel',
    'appointments:status',
    'services:read',
    'services:write',
    'assistants:read',
    'assistants:write',
    'availability:read',
    'availability:write',
  ],
  assistant: [
    'session:read',
    'dashboard:read',
    'patients:read',
    'patients:write',
    'appointments:read',
    'appointments:create',
    'appointments:update',
    'appointments:cancel',
    'appointments:status',
    'services:read',
    'availability:read',
  ],
}

export class AuthorizeServerActionUseCase {
  canPerformAction(
    session: ServerSessionContextDto,
    action: ServerAuthorizationAction,
  ): boolean {
    return permissionMatrix[session.role].includes(action)
  }

  assertCanPerformAction(
    session: ServerSessionContextDto,
    action: ServerAuthorizationAction,
  ): ServerSessionContextDto {
    if (!this.canPerformAction(session, action)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
      })
    }

    return session
  }
}

