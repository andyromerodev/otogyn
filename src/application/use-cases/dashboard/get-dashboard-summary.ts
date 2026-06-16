import type { DashboardSummaryViewModel } from '../../../presentation/view-models/dashboard'
import type { DashboardManagementRepository } from '../../ports/dashboard-management-repository'

export class GetDashboardSummaryUseCase {
  constructor(private readonly dashboardRepository: DashboardManagementRepository) {}

  execute(): Promise<DashboardSummaryViewModel> {
    return this.dashboardRepository.getSummary()
  }
}
