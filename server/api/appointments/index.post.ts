import { BusinessRuleError } from '../../../src/domain/errors/business-rule-error'
import { ScheduleAppointmentUseCase } from '../../../src/application/use-cases/schedule-appointment'
import { DrizzleAppointmentRepository } from '../../../src/infrastructure/repositories/drizzle-appointment-repository'
import { DrizzleAvailabilityRepository } from '../../../src/infrastructure/repositories/drizzle-availability-repository'
import { DrizzlePatientRepository } from '../../../src/infrastructure/repositories/drizzle-patient-repository'
import { DrizzleServiceRepository } from '../../../src/infrastructure/repositories/drizzle-service-repository'
import { appointmentSchema } from '../../../src/presentation/validators/appointment'
import { getCurrentUser } from '../../utils/get-current-user'
import { handleApiError } from '../../utils/handle-api-error'

export default defineEventHandler(async (event) => {
  try {
    const session = await getCurrentUser(event, ['admin_doctor', 'assistant'])
    const payload = await readBody(event)
    const input = appointmentSchema.parse(payload)

    const appointmentRepository = new DrizzleAppointmentRepository()
    const patientRepository = new DrizzlePatientRepository()
    const serviceRepository = new DrizzleServiceRepository()
    const availabilityRepository = new DrizzleAvailabilityRepository()

    const service = await serviceRepository.findById(input.serviceId)

    if (!service) {
      throw new BusinessRuleError('No puede existir una cita sin servicio.')
    }

    const startAt = new Date(input.startAt)

    if (Number.isNaN(startAt.getTime())) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Fecha y hora de inicio invalida.',
      })
    }

    const endAt = new Date(startAt)
    endAt.setMinutes(endAt.getMinutes() + service.defaultDurationMinutes)

    const useCase = new ScheduleAppointmentUseCase(
      appointmentRepository,
      patientRepository,
      serviceRepository,
      availabilityRepository,
    )

    return await useCase.execute({
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
