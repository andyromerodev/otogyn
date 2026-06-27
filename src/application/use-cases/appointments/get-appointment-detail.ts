import type { TodayAppointmentViewModel } from '../../../presentation/view-models/dashboard'
import type { AppointmentManagementRepository } from '../../ports/appointment-management-repository'

export class GetAppointmentDetailUseCase {
  constructor(private readonly appointmentRepository: AppointmentManagementRepository) {}

  execute(appointmentId: string): Promise<TodayAppointmentViewModel> {
    return this.appointmentRepository.getAppointmentDetail(appointmentId)
  }
}
