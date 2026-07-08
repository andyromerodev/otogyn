import type { AppointmentDirectoryQuery } from '../../dto/appointment-management'
import type { MedicalService } from '../../../domain/entities/medical-service'
import type { AppointmentManagementRepository } from '../../ports/appointment-management-repository'

export class ListAppointmentServicesUseCase {
  constructor(private readonly appointmentRepository: AppointmentManagementRepository) {}

  execute(query?: AppointmentDirectoryQuery): Promise<MedicalService[]> {
    return this.appointmentRepository.listServices(query)
  }
}
