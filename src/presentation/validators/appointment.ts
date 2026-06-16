import { z } from 'zod'

export const appointmentSchema = z.object({
  patientId: z.string().min(1),
  serviceId: z.string().min(1),
  professionalId: z.string().min(1).nullable().optional(),
  startAt: z.string().min(16),
  isUrgent: z.boolean().optional(),
  reason: z.string().max(255).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
})
