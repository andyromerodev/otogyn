import { z } from 'zod'

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
