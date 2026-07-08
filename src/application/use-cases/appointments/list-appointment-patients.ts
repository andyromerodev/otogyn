import type { AppointmentDirectoryQuery } from '../../dto/appointment-management'
import type { Patient } from '../../../domain/entities/patient'
import type { AppointmentManagementRepository } from '../../ports/appointment-management-repository'

export class ListAppointmentPatientsUseCase {
  constructor(private readonly appointmentRepository: AppointmentManagementRepository) {}

  execute(query?: AppointmentDirectoryQuery): Promise<Patient[]> {
    return this.appointmentRepository.listPatients(query)
  }
}
