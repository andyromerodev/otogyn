import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'services:read')
    const serviceId = getRouterParam(event, 'id')

    if (!serviceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Service id is required.',
      })
    }

    const service = await serverServiceLocator.services.getServiceDetailUseCase.execute({
      serviceId,
      organizationId: session.organizationId,
    })

    if (!service) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Service not found.',
      })
    }

    return service
  } catch (error) {
    handleApiError(error)
  }
})
