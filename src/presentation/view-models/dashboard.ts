import type { AppointmentStatus } from '../../domain/value-objects/appointment-status'

export interface DashboardSummaryViewModel {
  totalToday: number
  completedToday: number
  pendingToday: number
  urgentToday: number
  activeConsultationLabel: string | null
}

export interface TodayAppointmentViewModel {
  id: string
  patientName: string
  serviceName: string
  timeLabel: string
  status: AppointmentStatus
  statusLabel: string
  isUrgent: boolean
}
