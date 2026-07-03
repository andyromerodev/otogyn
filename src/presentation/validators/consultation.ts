import { z } from 'zod'

export const startConsultationSchema = z.object({
  appointmentId: z.string().uuid('ID de cita invalido.'),
})

const additionalExamSchema = z.object({
  name: z.string().trim().min(1).max(120),
  findings: z.string().trim().min(1).max(1000),
})

const diagnosisSchema = z.object({
  description: z.string().trim().min(1).max(500),
  cie10Code: z.string().trim().max(10).nullable(),
  type: z.enum(['presuntivo', 'definitivo', 'recurrente']),
})

const medicationSchema = z.object({
  name: z.string().trim().min(1).max(200),
  dose: z.string().trim().max(100).nullable(),
  route: z.string().trim().max(100).nullable(),
  frequency: z.string().trim().max(100).nullable(),
  duration: z.string().trim().max(100).nullable(),
  additionalInfo: z.string().trim().max(500).nullable(),
  isUsualMedication: z.boolean(),
})

export const updateConsultationSchema = z.object({
  anamnesisText: z.string().trim().max(5000).nullable().optional(),
  attachmentKeys: z.array(z.string().trim().min(1).max(300)).max(10).optional(),

  bloodPressure: z
    .string()
    .trim()
    .max(20)
    .regex(/^\d{1,3}\/\d{1,3}$/, 'Formato de presion arterial invalido (ej. 120/80).')
    .nullable()
    .optional(),
  heartRate: z.number().int().min(0).max(300).nullable().optional(),
  respiratoryRate: z.number().int().min(0).max(120).nullable().optional(),
  oxygenSaturation: z.number().int().min(0).max(100).nullable().optional(),
  temperature: z
    .number()
    .min(25)
    .max(45)
    .nullable()
    .optional()
    .transform((value) => (value === null || value === undefined ? value : value.toFixed(1))),
  additionalExams: z.array(additionalExamSchema).max(20).optional(),

  diagnoses: z.array(diagnosisSchema).max(20).optional(),
  appreciation: z.string().trim().max(3000).nullable().optional(),

  medications: z.array(medicationSchema).max(30).optional(),
  treatmentPlan: z.string().trim().max(3000).nullable().optional(),
  auxiliaryExams: z.array(z.string().trim().min(1).max(300)).max(30).optional(),
})
