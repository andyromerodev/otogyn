import type { MedicalService } from '../../../domain/entities/medical-service'
import type { AppointmentManagementRepository } from '../../ports/appointment-management-repository'

export class ListAppointmentServicesUseCase {
  constructor(private readonly appointmentRepository: AppointmentManagementRepository) {}

  execute(): Promise<MedicalService[]> {
    return this.appointmentRepository.listServices()
  }
}
