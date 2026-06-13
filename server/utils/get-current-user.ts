import { demoOrganization, demoUsers } from '../../src/infrastructure/mock/demo-data'

export interface SessionUserContext {
  userId: string
  organizationId: string
  role: 'admin_doctor' | 'assistant'
}

export const getCurrentUser = async (): Promise<SessionUserContext> => {
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
  }
}
