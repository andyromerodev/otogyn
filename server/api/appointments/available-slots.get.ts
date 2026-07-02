import { parseLocalDate } from '../../../src/application/utils/date/local-date'
import { appointmentAvailableSlotsQuerySchema } from '../../../src/presentation/validators/appointment'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'appointments:read')
    const query = await getValidatedQuery(event, appointmentAvailableSlotsQuerySchema.parse)

    const date = parseLocalDate(query.date)

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
