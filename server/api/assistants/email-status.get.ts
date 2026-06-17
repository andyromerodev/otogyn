import {
  getProvisionableAssistantEmailStatus,
} from '../../../src/infrastructure/auth/better-auth'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'assistants:read')
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
