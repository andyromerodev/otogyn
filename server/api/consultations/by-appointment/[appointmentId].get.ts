import { requireAuthorizedUser } from '../../../utils/authorization'
import { handleApiError } from '../../../utils/handle-api-error'
import { serverServiceLocator } from '../../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'consultations:read')
    const appointmentId = getRouterParam(event, 'appointmentId')

    if (!appointmentId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Appointment id is required.',
      })
    }

    return await serverServiceLocator.consultations.getConsultationByAppointmentUseCase.execute({
      appointmentId,
      organizationId: session.organizationId,
    })
  } catch (error) {
    handleApiError(error)
  }
})
