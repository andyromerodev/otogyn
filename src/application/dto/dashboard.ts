import type { PaymentMethod } from '../../domain/entities/payment'
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
  patientId: string
  serviceId: string
  professionalId: string | null
  patientName: string
  serviceName: string
  startAt: Date
  endAt: Date
  status: AppointmentStatus
  isUrgent: boolean
  reason: string | null
  notes: string | null
}

export interface AppointmentLinkedPaymentDto {
  id: string
  amount: number
  method: PaymentMethod
  paidAt: Date
}

export interface AppointmentDetailDto extends TodayAppointmentDto {
  agreedPrice: number | null
  linkedPayment: AppointmentLinkedPaymentDto | null
}
