import { parseAppDateTime } from '../../../src/application/utils/date/local-date'
import { appointmentSchema } from '../../../src/presentation/validators/appointment'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'appointments:update')
    const appointmentId = getRouterParam(event, 'id')

    if (!appointmentId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Appointment id is required.',
      })
    }

    const payload = await readBody(event)
    const input = appointmentSchema.parse(payload)
    const startAt = parseAppDateTime(input.startAt)

    if (Number.isNaN(startAt.getTime())) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Fecha y hora de inicio invalida.',
      })
    }

    return await serverServiceLocator.appointments.updateAppointmentUseCase.execute({
      appointmentId,
      patientId: input.patientId,
      serviceId: input.serviceId,
      professionalId: input.professionalId ?? null,
      startAt,
      isUrgent: input.isUrgent ?? false,
      reason: input.reason ?? null,
      notes: input.notes ?? null,
      updatedBy: session.userId,
      actorRole: session.role,
    })
  } catch (error) {
    handleApiError(error)
  }
})
