import { z } from 'zod'
import {
  preEvalAggravatingFactorValues,
  preEvalAlertSignValues,
  preEvalAssociatedSymptomValues,
  preEvalConsultationExpectationValues,
  preEvalMainReasonValues,
  preEvalPriorExamValues,
} from '../../domain/value-objects/pre-evaluation-form-options'

export const preEvaluationFormSchema = z.object({
  // Seccion 1: Datos del paciente
  fullName: z.string().trim().min(3, 'Ingresa tu nombre completo.').max(180),
  birthDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha invalido (AAAA-MM-DD).')
    .nullable()
    .optional(),
  residenceCityCountry: z.string().trim().max(255).nullable().optional(),
  phone: z.string().trim().min(6, 'Ingresa un numero de WhatsApp valido.').max(40),
  email: z.string().trim().email('Email invalido.').max(255).nullable().optional().or(z.literal('')),

  // Seccion 2: Motivo de consulta
  complaintDescription: z.string().trim().max(3000).nullable().optional(),
  symptomDurationText: z.string().trim().max(255).nullable().optional(),
  medicalHistory: z.string().trim().max(3000).nullable().optional().or(z.literal('')),

  // Seccion 3: Documentacion medica
  previousTreatmentsAndExams: z.string().trim().max(3000).nullable().optional().or(z.literal('')),
  attachmentKeys: z.array(z.string().min(1).max(300)).max(10).optional().default([]),

  // Seccion 4: Confirmacion y consentimiento
  understandsVirtualConditions: z.boolean().optional().default(true),
  consentPrivacyPolicy: z.boolean().optional().default(true),

  // Campos heredados/retrocompatibles
  age: z.number().int().min(0).max(120).nullable().optional(),
  city: z.string().max(120).nullable().optional(),
  mainReasons: z.array(z.enum(preEvalMainReasonValues)).max(preEvalMainReasonValues.length).optional().default([]),
  mainReasonOtherText: z.string().max(500).nullable().optional(),

  symptomDuration: z.enum(['lt_1mo', '1_3mo', '3_12mo', 'gt_1yr']).nullable().optional(),
  symptomPattern: z.enum(['constant', 'intermittent', 'worsening']).nullable().optional(),

  associatedSymptoms: z
    .array(z.enum(preEvalAssociatedSymptomValues))
    .max(preEvalAssociatedSymptomValues.length)
    .optional()
    .default([]),
  aggravatingFactors: z
    .array(z.enum(preEvalAggravatingFactorValues))
    .max(preEvalAggravatingFactorValues.length)
    .optional()
    .default([]),

  hasPriorRefluxDiagnosis: z.enum(['yes', 'no']).nullable().optional(),
  hasPriorTreatment: z.enum(['yes', 'no']).nullable().optional(),
  priorMedicationUsed: z.string().max(500).nullable().optional(),
  treatmentImprovement: z.enum(['yes', 'partial', 'no']).nullable().optional(),

  priorExams: z.array(z.enum(preEvalPriorExamValues)).max(preEvalPriorExamValues.length).optional().default([]),

  alertSigns: z.array(z.enum(preEvalAlertSignValues)).max(preEvalAlertSignValues.length).optional().default([]),
  consultationExpectations: z
    .array(z.enum(preEvalConsultationExpectationValues))
    .max(preEvalConsultationExpectationValues.length)
    .optional()
    .default([]),

  consentInfoTruthful: z.boolean().optional().default(true),
  consentUnderstandsNotConsultation: z.boolean().optional().default(true),
  publicSecurityToken: z.string().min(1, 'Solicitud invalida.'),
  website: z.string().max(200).nullable().optional(),
})

export const preEvaluationFormListQuerySchema = z.object({
  search: z.string().trim().max(120).optional().default(''),
  filter: z.enum(['all', 'pending_review', 'reviewed']).optional().default('all'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
})

export const linkPreEvaluationFormSchema = z.object({
  patientId: z.string().uuid('ID de paciente invalido.'),
})
