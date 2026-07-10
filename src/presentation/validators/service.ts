import { z } from 'zod'

export const publicServicesQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(12),
})

export const serviceSchema = z.object({
  name: z.string().min(3).max(180),
  description: z.string().max(1000).nullable().optional(),
  defaultDurationMinutes: z.number().int().positive().max(480),
  price: z.number().nonnegative().nullable().optional(),
  isActive: z.boolean().optional(),
})

export const updateServiceSchema = z.object({
  name: z.string().min(3).max(180).optional(),
  description: z.string().max(1000).nullable().optional(),
  defaultDurationMinutes: z.number().int().positive().max(480).optional(),
  price: z.number().nonnegative().nullable().optional(),
  isActive: z.boolean().optional(),
})
