import { z } from 'zod'
import { appointmentStatuses } from '../../domain/value-objects/appointment-status'

export const appointmentSchema = z.object({
  patientId: z.string().min(1),
  serviceId: z.string().min(1),
  professionalId: z.string().min(1).nullable().optional(),
  startAt: z.string().min(16),
  isUrgent: z.boolean().optional(),
  reason: z.string().max(255).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
})

export const appointmentStatusSchema = z.object({
  status: z.enum(
    appointmentStatuses.filter((status) => status !== 'cancelled') as [
      'scheduled',
      'confirmed',
      'checked_in',
      'in_progress',
      'completed',
      'no_show',
    ],
  ),
})
