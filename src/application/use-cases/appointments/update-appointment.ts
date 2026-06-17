import type { Appointment } from '../../../domain/entities/appointment'
import type { AppointmentMutationInput } from '../../dto/appointment-management'
import type { AppointmentManagementRepository } from '../../ports/appointment-management-repository'

export class UpdateAppointmentUseCase {
  constructor(private readonly appointmentRepository: AppointmentManagementRepository) {}

  execute(appointmentId: string, input: AppointmentMutationInput): Promise<Appointment> {
    return this.appointmentRepository.updateAppointment(appointmentId, {
      patientId: input.patientId,
      serviceId: input.serviceId,
      professionalId: input.professionalId ?? null,
      startAt: input.startAt,
      isUrgent: input.isUrgent ?? false,
      reason: input.reason ?? null,
      notes: input.notes ?? null,
    })
  }
}
