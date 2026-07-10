import { z } from 'zod'

export const appointmentStatsQuerySchema = z.object({
  range: z.enum(['week', 'month', 'year']).default('year'),
})
