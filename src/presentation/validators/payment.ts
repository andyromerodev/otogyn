import { z } from 'zod'
import { paymentMethods } from '../../domain/entities/payment'

export const paymentSchema = z.object({
  patientId: z.string().uuid('ID de paciente invalido.').nullable().optional(),
  appointmentId: z.string().uuid('ID de cita invalido.').nullable().optional(),
  consultationId: z.string().uuid('ID de consulta invalido.').nullable().optional(),
  amount: z.number().positive('El monto debe ser mayor a cero.').max(99999999.99),
  method: z.enum(paymentMethods),
  concept: z.string().trim().min(1, 'El concepto es obligatorio.').max(255),
  paidAt: z.coerce.date(),
  notes: z.string().max(2000).nullable().optional(),
})

export const updatePaymentSchema = paymentSchema.partial()

export const paymentListQuerySchema = z.object({
  patientId: z.string().uuid('ID de paciente invalido.').optional(),
  method: z.enum(paymentMethods).optional(),
  paidAtFrom: z.coerce.date().optional(),
  paidAtTo: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
})
