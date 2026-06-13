import type { AppointmentStatus } from '../../domain/value-objects/appointment-status'

export interface DashboardSummaryDto {
  totalToday: number
  completedToday: number
  pendingToday: number
  urgentToday: number
  activeConsultationLabel: string | null
}

export interface TodayAppointmentDto {
  id: string
  patientName: string
  serviceName: string
  startAt: Date
  endAt: Date
  status: AppointmentStatus
  isUrgent: boolean
}
