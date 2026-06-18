import { z } from 'zod'
import { requireAuthorizedUser } from '../../../utils/authorization'
import { handleApiError } from '../../../utils/handle-api-error'
import { serverServiceLocator } from '../../../utils/server-service-locator'

const toggleSchema = z.object({
  isActive: z.boolean(),
})

export default defineEventHandler(async (event) => {
  try {
    await requireAuthorizedUser(event, 'availability:write')
    const availabilityId = getRouterParam(event, 'id')

    if (!availabilityId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Availability id is required.',
      })
    }

    const payload = await readBody(event)
    const { isActive } = toggleSchema.parse(payload)

    return await serverServiceLocator.availability.toggleAvailabilityActiveUseCase.execute({
      id: availabilityId,
      isActive,
    })
  } catch (error) {
    handleApiError(error)
  }
})
