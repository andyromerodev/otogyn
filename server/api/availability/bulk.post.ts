import { availabilityBulkMutationSchema } from '../../../src/presentation/validators/availability'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'availability:write')
    const payload = await readBody(event)
    const input = availabilityBulkMutationSchema.parse(payload)

    const inputs = input.weekdays.map((weekday) => ({
      organizationId: session.organizationId,
      weekday,
      startTime: input.startTime,
      endTime: input.endTime,
      isActive: input.isActive,
    }))

    return await serverServiceLocator.availability.createBulkAvailabilityUseCase.execute(inputs)
  } catch (error) {
    handleApiError(error)
  }
})
