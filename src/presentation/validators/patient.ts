import { z } from 'zod'

export const patientSchema = z.object({
  fullName: z.string().min(3).max(180),
  phone: z.string().min(7).max(40),
  email: z.string().email().nullable().optional(),
  birthDate: z.string().nullable().optional(),
  documentId: z.string().max(40).nullable().optional(),
  administrativeNotes: z.string().max(1000).nullable().optional(),
})
