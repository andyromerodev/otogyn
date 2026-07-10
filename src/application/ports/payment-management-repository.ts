import type { PaymentMethod } from '../../domain/entities/payment'
import type { PaymentListPageResult } from '../../domain/repositories/payment-repository'

export interface ListPaymentsClientInput {
  patientId?: string
  method?: PaymentMethod
  paidAtFrom?: string
  paidAtTo?: string
  page?: number
  pageSize?: number
  search?: string
}

export interface CreatePaymentClientInput {
  patientId?: string | null
  appointmentId?: string | null
  consultationId?: string | null
  amount: number
  method: PaymentMethod
  concept: string
  paidAt: string
  notes?: string | null
}

export interface PaymentManagementRepository {
  listPayments(input: ListPaymentsClientInput): Promise<PaymentListPageResult>
  createPayment(input: CreatePaymentClientInput): Promise<void>
}
