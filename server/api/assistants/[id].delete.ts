import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'assistants:write')
    const assistantUserId = getRouterParam(event, 'id')

    if (!assistantUserId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Assistant id is required.',
      })
    }

    await serverServiceLocator.assistants.deleteAssistantUseCase.execute({
      organizationId: session.organizationId,
      userId: assistantUserId,
    })

    return {
      success: true,
    }
  } catch (error) {
    handleApiError(error)
  }
})
