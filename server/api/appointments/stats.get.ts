import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'
import { appointmentStatsQuerySchema } from '../../../src/presentation/validators/appointment-stats'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'appointments:read')
    const { range } = await getValidatedQuery(event, appointmentStatsQuerySchema.parse)

    return await serverServiceLocator.appointments.getAppointmentStatsUseCase.execute({
      organizationId: session.organizationId,
      range,
    })
  } catch (error) {
    handleApiError(error)
  }
})
