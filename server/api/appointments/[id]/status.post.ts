import { appointmentStatusSchema } from '../../../../src/presentation/validators/appointment'
import { requireAuthorizedUser } from '../../../utils/authorization'
import { handleApiError } from '../../../utils/handle-api-error'
import { serverServiceLocator } from '../../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'appointments:status')
    const appointmentId = getRouterParam(event, 'id')

    if (!appointmentId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Appointment id is required.',
      })
    }

    const payload = await readBody(event)
    const input = appointmentStatusSchema.parse(payload)

    return await serverServiceLocator.appointments.changeAppointmentStatusUseCase.execute({
      appointmentId,
      status: input.status,
      updatedBy: session.userId,
      actorRole: session.role,
    })
  } catch (error) {
    handleApiError(error)
  }
})
