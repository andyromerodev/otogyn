import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'services:write')
    const serviceId = getRouterParam(event, 'id')

    if (!serviceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Service id is required.',
      })
    }

    await serverServiceLocator.services.deleteServiceUseCase.execute({
      serviceId,
      organizationId: session.organizationId,
    })

    return {
      success: true,
    }
  } catch (error) {
    handleApiError(error)
  }
})
