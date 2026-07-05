import { z } from 'zod'
import { paymentMethods } from '../../domain/entities/payment'

export const financeExportQuerySchema = z.object({
  type: z.enum(['payments', 'expenses']),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  patientId: z.string().uuid('ID de paciente invalido.').optional(),
  method: z.enum(paymentMethods).optional(),
  categoryId: z.string().uuid('ID de categoría invalido.').optional(),
})
