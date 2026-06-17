import type { H3Event } from 'h3'
import type { SessionUserContext } from './get-current-user'
import { getCurrentUser } from './get-current-user'

export const requireOrganizationUser = async (event: H3Event): Promise<SessionUserContext> =>
  getCurrentUser(event, ['admin_doctor', 'assistant'])

export const requireAdminDoctorUser = async (event: H3Event): Promise<SessionUserContext> =>
  getCurrentUser(event, ['admin_doctor'])

export const requireStaffUser = async (event: H3Event): Promise<SessionUserContext> =>
  getCurrentUser(event, ['admin_doctor', 'assistant'])
