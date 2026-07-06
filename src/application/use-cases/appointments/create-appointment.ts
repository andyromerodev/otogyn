import type { Appointment } from '../../../domain/entities/appointment'
import type { AppointmentMutationInput } from '../../dto/appointment-management'
import type { AppointmentManagementRepository } from '../../ports/appointment-management-repository'

export class CreateAppointmentUseCase {
  constructor(private readonly appointmentRepository: AppointmentManagementRepository) {}

  execute(input: AppointmentMutationInput): Promise<Appointment> {
    return this.appointmentRepository.createAppointment({
      patientId: input.patientId,
      serviceId: input.serviceId,
      agreedPrice: input.agreedPrice ?? null,
      professionalId: input.professionalId ?? null,
      startAt: input.startAt,
      isUrgent: input.isUrgent ?? false,
      reason: input.reason ?? null,
      notes: input.notes ?? null,
    })
  }
}
