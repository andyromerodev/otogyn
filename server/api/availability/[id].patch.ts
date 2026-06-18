import { updateAvailabilitySchema } from '../../../src/presentation/validators/availability'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

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
    const input = updateAvailabilitySchema.parse(payload)

    return await serverServiceLocator.availability.updateAvailabilityUseCase.execute(availabilityId, {
      weekday: input.weekday,
      startTime: input.startTime,
      endTime: input.endTime,
      isActive: input.isActive,
    })
  } catch (error) {
    handleApiError(error)
  }
})
