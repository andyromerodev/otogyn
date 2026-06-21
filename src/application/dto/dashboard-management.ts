import type {
  DashboardSummaryViewModel,
  TodayAppointmentViewModel,
} from '../../presentation/view-models/dashboard'

export interface DashboardMetricViewModel {
  label: string
  value: number | string
  note: string
  icon: string
  tone: 'teal' | 'green' | 'amber' | 'rose'
}

export interface ActiveConsultationViewModel {
  patientName: string
  serviceName: string
  timeLabel: string
  durationMinutes: number
}

export interface DashboardScreenData {
  summary: DashboardSummaryViewModel
  appointments: TodayAppointmentViewModel[]
}
