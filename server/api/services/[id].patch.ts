import { updateServiceSchema } from '../../../src/presentation/validators/service'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    await requireAuthorizedUser(event, 'services:write')
    const serviceId = getRouterParam(event, 'id')

    if (!serviceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Service id is required.',
      })
    }

    const payload = await readBody(event)
    const input = updateServiceSchema.parse(payload)

    const service = await serverServiceLocator.services.updateServiceUseCase.execute({
      id: serviceId,
      name: input.name,
      description: input.description,
      defaultDurationMinutes: input.defaultDurationMinutes,
      price: input.price,
      isActive: input.isActive,
    })

    return service
  } catch (error) {
    handleApiError(error)
  }
})
