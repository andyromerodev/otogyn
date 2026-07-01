import { appointmentAvailableSlotsQuerySchema } from '../../../src/presentation/validators/appointment'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'appointments:read')
    const query = await getValidatedQuery(event, appointmentAvailableSlotsQuerySchema.parse)

    const [year, month, day] = query.date.split('-').map(Number)
    const date = new Date(year!, month! - 1, day!)
    date.setHours(0, 0, 0, 0)

    return await serverServiceLocator.appointments.getAppointmentAvailableSlotsUseCase.execute({
      organizationId: session.organizationId,
      date,
      serviceId: query.serviceId,
      excludeAppointmentId: query.excludeAppointmentId,
    })
  } catch (error) {
    handleApiError(error)
  }
})
