import { z } from 'zod'

export const patientSchema = z.object({
  fullName: z.string().min(3).max(180),
  phone: z.string().min(7).max(40),
  email: z.string().email().nullable().optional(),
  birthDate: z.string().nullable().optional(),
  documentId: z.string().max(40).nullable().optional(),
  administrativeNotes: z.string().max(1000).nullable().optional(),
  isUrgent: z.boolean().optional().default(false),
})

export const patientListQuerySchema = z.object({
  search: z.string().trim().max(120).optional().default(''),
  filter: z.enum(['all', 'today', 'urgent', 'follow_up']).optional().default('all'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
})
