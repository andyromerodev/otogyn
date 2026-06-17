import {
  getProvisionableAssistantEmailStatus,
} from '../../../src/infrastructure/auth/better-auth'
import { handleApiError } from '../../utils/handle-api-error'
import { requireAdminDoctorUser } from '../../utils/require-user'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAdminDoctorUser(event)
    const email = getQuery(event).email

    if (typeof email !== 'string' || !email.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is required.',
      })
    }

    return await getProvisionableAssistantEmailStatus(email, session.organizationId)
  } catch (error) {
    handleApiError(error)
  }
})
