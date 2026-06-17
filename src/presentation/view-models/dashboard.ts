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
  patientId: string
  serviceId: string
  professionalId: string | null
  patientName: string
  serviceName: string
  startAt: string
  endAt: string
  timeLabel: string
  status: AppointmentStatus
  statusLabel: string
  isUrgent: boolean
  reason: string | null
  notes: string | null
}
