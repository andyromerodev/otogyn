import type { Appointment } from '../../../domain/entities/appointment'
import type { AppointmentManagementRepository } from '../../ports/appointment-management-repository'

export class CancelAppointmentUseCase {
  constructor(private readonly appointmentRepository: AppointmentManagementRepository) {}

  execute(appointmentId: string): Promise<Appointment> {
    return this.appointmentRepository.cancelAppointment({
      appointmentId,
    })
  }
}
