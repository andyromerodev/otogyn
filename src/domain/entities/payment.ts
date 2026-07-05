export const paymentMethods = ['efectivo', 'tarjeta', 'transferencia'] as const

export type PaymentMethod = (typeof paymentMethods)[number]

export interface Payment {
  id: string
  organizationId: string
  patientId: string | null
  appointmentId: string | null
  consultationId: string | null
  amount: number
  method: PaymentMethod
  concept: string
  paidAt: Date
  notes: string | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
}
