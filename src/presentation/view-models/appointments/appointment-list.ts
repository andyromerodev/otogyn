import type { PaymentMethod } from '../../../domain/entities/payment'
import type { AppointmentStatus } from '../../../domain/value-objects/appointment-status'

export type AppointmentPaymentStatus = 'paid' | 'pending'

export interface AppointmentListLinkedPaymentViewModel {
  id: string
  amount: number
  method: PaymentMethod
  paidAt: string
}

export interface AppointmentListItemViewModel {
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
  paymentStatus: AppointmentPaymentStatus
  linkedPayment: AppointmentListLinkedPaymentViewModel | null
}

export const resolveAppointmentPaymentBadge = (appointment: Pick<
  AppointmentListItemViewModel,
  'paymentStatus'
>) => (
  appointment.paymentStatus === 'paid'
    ? { label: 'Pagada', tone: 'success' as const }
    : { label: 'Pendiente de pago', tone: 'pending' as const }
)
