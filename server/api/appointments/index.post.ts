import { BusinessRuleError } from '../../../src/domain/errors/business-rule-error'
import { parseAppDateTime } from '../../../src/application/utils/date/local-date'
import { appointmentSchema } from '../../../src/presentation/validators/appointment'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'appointments:create')
    const payload = await readBody(event)
    const input = appointmentSchema.parse(payload)
    const service = await serverServiceLocator.repositories.serviceRepository.findById(input.serviceId)

    if (!service) {
      throw new BusinessRuleError('No puede existir una cita sin servicio.')
    }

    const startAt = parseAppDateTime(input.startAt)

    if (Number.isNaN(startAt.getTime())) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Fecha y hora de inicio invalida.',
      })
    }

    const endAt = new Date(startAt)
    endAt.setMinutes(endAt.getMinutes() + service.defaultDurationMinutes)

    return await serverServiceLocator.appointments.scheduleAppointmentUseCase.execute({
      id: crypto.randomUUID(),
      organizationId: session.organizationId,
      patientId: input.patientId,
      serviceId: input.serviceId,
      professionalId: input.professionalId ?? null,
      startAt,
      endAt,
      status: 'scheduled',
      isUrgent: input.isUrgent ?? false,
      reason: input.reason ?? null,
      notes: input.notes ?? null,
      createdBy: session.userId,
      updatedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      cancelledAt: null,
    })
  } catch (error) {
    handleApiError(error)
  }
})
