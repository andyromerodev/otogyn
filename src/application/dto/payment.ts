import type { PaymentMethod } from '../../domain/entities/payment'

export interface PaymentMutationInput {
  patientId?: string | null
  appointmentId?: string | null
  consultationId?: string | null
  amount: number
  method: PaymentMethod
  concept: string
  paidAt: Date
  notes?: string | null
}

export interface PaymentUpdateInput {
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

export interface PaymentListQueryInput {
  patientId?: string
  method?: PaymentMethod
  paidAtFrom?: Date
  paidAtTo?: Date
  page?: number
  pageSize?: number
  search?: string
}
