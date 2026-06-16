import type { DashboardManagementRepository } from '../../../application/ports/dashboard-management-repository'
import type {
  DashboardSummaryViewModel,
  TodayAppointmentViewModel,
} from '../../../presentation/view-models/dashboard'
import type { DashboardRemoteDataSource } from '../remote/dashboard-remote-data-source'

export class DashboardManagementRepositoryImpl implements DashboardManagementRepository {
  constructor(private readonly remoteDataSource: DashboardRemoteDataSource) {}

  getSummary(): Promise<DashboardSummaryViewModel> {
    return this.remoteDataSource.getSummary()
  }

  getTodayAppointments(): Promise<TodayAppointmentViewModel[]> {
    return this.remoteDataSource.getTodayAppointments()
  }
}
