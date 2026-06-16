import type {
  DashboardSummaryViewModel,
  TodayAppointmentViewModel,
} from '../../../presentation/view-models/dashboard'
import type { DashboardRemoteDataSource } from './dashboard-remote-data-source'

export class HttpDashboardRemoteDataSource implements DashboardRemoteDataSource {
  async getSummary(): Promise<DashboardSummaryViewModel> {
    return $fetch<DashboardSummaryViewModel>('/api/dashboard/summary' as string)
  }

  async getTodayAppointments(): Promise<TodayAppointmentViewModel[]> {
    return $fetch<TodayAppointmentViewModel[]>('/api/appointments/today' as string)
  }
}
