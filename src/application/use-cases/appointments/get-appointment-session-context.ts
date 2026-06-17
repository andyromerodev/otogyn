import type { AppointmentSessionContextDto } from '../../dto/appointment-management'
import type { AppointmentManagementRepository } from '../../ports/appointment-management-repository'

export class GetAppointmentSessionContextUseCase {
  constructor(private readonly appointmentRepository: AppointmentManagementRepository) {}

  execute(): Promise<AppointmentSessionContextDto> {
    return this.appointmentRepository.getSessionContext()
  }
}
