import type { Appointment } from '../../../domain/entities/appointment'
import type { AppointmentStatusMutationInput } from '../../dto/appointment-management'
import type { AppointmentManagementRepository } from '../../ports/appointment-management-repository'

export class ChangeAppointmentStatusUseCase {
  constructor(private readonly appointmentRepository: AppointmentManagementRepository) {}

  execute(input: AppointmentStatusMutationInput): Promise<Appointment> {
    return this.appointmentRepository.changeAppointmentStatus(input)
  }
}
