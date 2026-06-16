import type {
  DashboardSummaryViewModel,
  TodayAppointmentViewModel,
} from '../../presentation/view-models/dashboard'

export interface DashboardMetricViewModel {
  label: string
  value: number | string
  note: string
}

export interface DashboardScreenData {
  summary: DashboardSummaryViewModel
  appointments: TodayAppointmentViewModel[]
}
