import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'availability:read')
    const today = new Date()

    const [availability, blockedSlots] = await Promise.all([
      serverServiceLocator.availability.listAvailabilityUseCase.execute({
        organizationId: session.organizationId,
      }),
      serverServiceLocator.availability.listBlockedSlotsUseCase.execute({
        organizationId: session.organizationId,
        day: today,
      }),
    ])

    return { availability, blockedSlots }
  } catch (error) {
    handleApiError(error)
  }
})
