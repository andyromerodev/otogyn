export interface ServerAuthRequestContextDto {
  headers?: HeadersInit
}

export interface ServerSessionContextDto {
  userId: string
  organizationId: string
  role: 'admin_doctor' | 'assistant'
  email?: string
  name?: string
}

export type ServerAuthorizationAction =
  | 'session:read'
  | 'dashboard:read'
  | 'patients:read'
  | 'patients:write'
  | 'pre_evaluation_forms:read'
  | 'pre_evaluation_forms:write'
  | 'appointments:read'
  | 'appointments:create'
  | 'appointments:update'
  | 'appointments:cancel'
  | 'appointments:status'
  | 'services:read'
  | 'services:write'
  | 'assistants:read'
  | 'assistants:write'
  | 'availability:read'
  | 'availability:write'
  | 'calendar:read'
  | 'consultations:read'
  | 'consultations:write'
  | 'finances:read'
  | 'finances:write'

