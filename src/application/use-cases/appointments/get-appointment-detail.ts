import type { AppointmentDetailViewModel } from '../../../presentation/view-models/appointments/appointment-detail'
import type { AppointmentManagementRepository } from '../../ports/appointment-management-repository'

export class GetAppointmentDetailUseCase {
  constructor(private readonly appointmentRepository: AppointmentManagementRepository) {}

  execute(appointmentId: string): Promise<AppointmentDetailViewModel> {
    return this.appointmentRepository.getAppointmentDetail(appointmentId)
  }
}
