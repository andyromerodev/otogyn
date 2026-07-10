import { z } from 'zod'

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

export const availabilityMutationSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  startTime: z.string().regex(timeRegex, 'Formato HH:MM requerido'),
  endTime: z.string().regex(timeRegex, 'Formato HH:MM requerido'),
  isActive: z.boolean(),
})

export const updateAvailabilitySchema = z.object({
  weekday: z.number().int().min(0).max(6).optional(),
  startTime: z.string().regex(timeRegex, 'Formato HH:MM requerido').optional(),
  endTime: z.string().regex(timeRegex, 'Formato HH:MM requerido').optional(),
  isActive: z.boolean().optional(),
})

export const blockedSlotMutationSchema = z.object({
  startsAt: z.string(),
  endsAt: z.string(),
  reason: z.string().max(255).nullable().optional(),
})

const dateRegex = /^\d{4}-\d{2}-\d{2}$/

export const blockedSlotBulkMutationSchema = z.object({
  startDate: z.string().regex(dateRegex, 'Formato YYYY-MM-DD requerido'),
  endDate: z.string().regex(dateRegex, 'Formato YYYY-MM-DD requerido'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato HH:MM requerido'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato HH:MM requerido'),
  reason: z.string().max(255).nullable().optional(),
})

export const availabilityBulkMutationSchema = z.object({
  weekdays: z.array(z.number().int().min(0).max(6)).min(1).max(7),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato HH:MM requerido'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato HH:MM requerido'),
  isActive: z.boolean(),
})
