import { requireAuthorizedUser } from '../../../utils/authorization'
import { handleApiError } from '../../../utils/handle-api-error'
import { serverServiceLocator } from '../../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'appointments:cancel')
    const appointmentId = getRouterParam(event, 'id')

    if (!appointmentId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Appointment id is required.',
      })
    }

    return await serverServiceLocator.appointments.cancelAppointmentUseCase.execute({
      appointmentId,
      updatedBy: session.userId,
      actorRole: session.role,
    })
  } catch (error) {
    handleApiError(error)
  }
})
