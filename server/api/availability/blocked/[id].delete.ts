import { requireAuthorizedUser } from '../../../utils/authorization'
import { handleApiError } from '../../../utils/handle-api-error'
import { serverServiceLocator } from '../../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    await requireAuthorizedUser(event, 'availability:write')
    const slotId = getRouterParam(event, 'id')

    if (!slotId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Blocked slot id is required.',
      })
    }

    await serverServiceLocator.availability.deleteBlockedSlotUseCase.execute({
      id: slotId,
    })

    return { success: true }
  } catch (error) {
    handleApiError(error)
  }
})
