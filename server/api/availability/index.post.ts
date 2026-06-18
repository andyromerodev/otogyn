import { availabilityMutationSchema } from '../../../src/presentation/validators/availability'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'availability:write')
    const payload = await readBody(event)
    const input = availabilityMutationSchema.parse(payload)

    return await serverServiceLocator.availability.createAvailabilityUseCase.execute({
      organizationId: session.organizationId,
      weekday: input.weekday,
      startTime: input.startTime,
      endTime: input.endTime,
      isActive: input.isActive,
    })
  } catch (error) {
    handleApiError(error)
  }
})
