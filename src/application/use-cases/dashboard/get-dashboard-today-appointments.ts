import type { TodayAppointmentViewModel } from '../../../presentation/view-models/dashboard'
import type { DashboardManagementRepository } from '../../ports/dashboard-management-repository'

export class GetDashboardTodayAppointmentsUseCase {
  constructor(private readonly dashboardRepository: DashboardManagementRepository) {}

  execute(): Promise<TodayAppointmentViewModel[]> {
    return this.dashboardRepository.getTodayAppointments()
  }
}
