import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'availability:read')

    const [availability, blockedSlots] = await Promise.all([
      serverServiceLocator.availability.listAvailabilityUseCase.execute({
        organizationId: session.organizationId,
      }),
      serverServiceLocator.availability.listUpcomingBlockedSlotsUseCase.execute({
        organizationId: session.organizationId,
      }),
    ])

    return { availability, blockedSlots }
  } catch (error) {
    handleApiError(error)
  }
})
