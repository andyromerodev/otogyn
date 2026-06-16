import type { Patient } from '../../../domain/entities/patient'
import type { AppointmentManagementRepository } from '../../ports/appointment-management-repository'

export class ListAppointmentPatientsUseCase {
  constructor(private readonly appointmentRepository: AppointmentManagementRepository) {}

  execute(): Promise<Patient[]> {
    return this.appointmentRepository.listPatients()
  }
}
