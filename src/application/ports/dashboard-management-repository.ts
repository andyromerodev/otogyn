import type {
  DashboardSummaryViewModel,
  TodayAppointmentViewModel,
} from '../../presentation/view-models/dashboard'

export interface DashboardManagementRepository {
  getSummary(): Promise<DashboardSummaryViewModel>
  getTodayAppointments(): Promise<TodayAppointmentViewModel[]>
}
