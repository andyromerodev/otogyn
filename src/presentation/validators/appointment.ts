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

export const appointmentAvailableSlotsQuerySchema = z.object({
  serviceId: z.string().uuid('ID de servicio invalido.'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha invalido, usar YYYY-MM-DD.'),
  excludeAppointmentId: z.string().uuid('ID de cita invalido.').optional(),
})

export const appointmentListQuerySchema = z.object({
  search: z.string().trim().max(120).optional().default(''),
  filter: z.enum([
    'all',
    'today',
    'current_week',
    'last_week',
    'current_month',
    'last_month',
  ]).optional().default('all'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
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
