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
    'pre_evaluation_forms:read',
    'pre_evaluation_forms:write',
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
    'calendar:read',
    'consultations:read',
    'consultations:write',
  ],
  assistant: [
    'session:read',
    'dashboard:read',
    'patients:read',
    'patients:write',
    'pre_evaluation_forms:read',
    'pre_evaluation_forms:write',
    'appointments:read',
    'appointments:create',
    'appointments:update',
    'appointments:cancel',
    'appointments:status',
    'services:read',
    'availability:read',
    'calendar:read',
    'consultations:read',
    'consultations:write',
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

