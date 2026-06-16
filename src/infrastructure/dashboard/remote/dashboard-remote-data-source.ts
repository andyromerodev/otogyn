import type {
  DashboardSummaryViewModel,
  TodayAppointmentViewModel,
} from '../../../presentation/view-models/dashboard'

export interface DashboardRemoteDataSource {
  getSummary(): Promise<DashboardSummaryViewModel>
  getTodayAppointments(): Promise<TodayAppointmentViewModel[]>
}
