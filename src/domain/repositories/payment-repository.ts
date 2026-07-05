import type { Payment, PaymentMethod } from '../entities/payment'

export interface PaymentListPageQuery {
  organizationId: string
  page: number
  pageSize: number
  patientId?: string
  method?: PaymentMethod
  paidAtFrom?: Date
  paidAtTo?: Date
}

export interface PaymentListItem extends Payment {
  patientName: string | null
}

export interface PaymentListPageResult {
  items: PaymentListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface UpdatePaymentInput {
  id: string
  patientId?: string | null
  appointmentId?: string | null
  consultationId?: string | null
  amount?: number
  method?: PaymentMethod
  concept?: string
  paidAt?: Date
  notes?: string | null
}

export interface PaymentRepository {
  findById(paymentId: string): Promise<Payment | null>
  listPage(query: PaymentListPageQuery): Promise<PaymentListPageResult>
  create(payment: Payment): Promise<Payment>
  update(input: UpdatePaymentInput): Promise<Payment>
  delete(paymentId: string): Promise<void>
}
