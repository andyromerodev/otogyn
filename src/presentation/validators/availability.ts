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
