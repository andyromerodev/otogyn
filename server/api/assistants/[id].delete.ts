import { DrizzleAssistantRepository } from '../../../src/infrastructure/repositories/drizzle-assistant-repository'
import { handleApiError } from '../../utils/handle-api-error'
import { requireAdminDoctorUser } from '../../utils/require-user'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAdminDoctorUser(event)
    const assistantUserId = getRouterParam(event, 'id')

    if (!assistantUserId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Assistant id is required.',
      })
    }

    const assistantRepository = new DrizzleAssistantRepository()

    await assistantRepository.deleteAssistant(session.organizationId, assistantUserId)

    return {
      success: true,
    }
  } catch (error) {
    handleApiError(error)
  }
})
