import type { PaymentMethod } from '../../../domain/entities/payment'
import type { AppointmentStatus } from '../../../domain/value-objects/appointment-status'

export interface AppointmentLinkedPaymentViewModel {
  id: string
  amount: number
  method: PaymentMethod
  paidAt: string
}

export interface AppointmentDetailViewModel {
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
  agreedPrice: number | null
  linkedPayment: AppointmentLinkedPaymentViewModel | null
}
