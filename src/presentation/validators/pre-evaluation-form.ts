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
  fullName: z.string().min(3, 'Nombre demasiado corto.').max(180),
  age: z.number().int().min(0).max(120).nullable().optional(),
  city: z.string().max(120).nullable().optional(),
  phone: z.string().min(6, 'Telefono demasiado corto.').max(40),
  email: z.string().email('Email invalido.').max(255).nullable().optional(),

  mainReasons: z.array(z.enum(preEvalMainReasonValues)).max(preEvalMainReasonValues.length),
  mainReasonOtherText: z.string().max(500).nullable().optional(),
  complaintDescription: z.string().max(2000).nullable().optional(),

  symptomDuration: z.enum(['lt_1mo', '1_3mo', '3_12mo', 'gt_1yr']).nullable().optional(),
  symptomPattern: z.enum(['constant', 'intermittent', 'worsening']).nullable().optional(),

  associatedSymptoms: z
    .array(z.enum(preEvalAssociatedSymptomValues))
    .max(preEvalAssociatedSymptomValues.length),
  aggravatingFactors: z
    .array(z.enum(preEvalAggravatingFactorValues))
    .max(preEvalAggravatingFactorValues.length),

  hasPriorRefluxDiagnosis: z.enum(['yes', 'no']).nullable().optional(),
  hasPriorTreatment: z.enum(['yes', 'no']).nullable().optional(),
  priorMedicationUsed: z.string().max(500).nullable().optional(),
  treatmentImprovement: z.enum(['yes', 'partial', 'no']).nullable().optional(),

  priorExams: z.array(z.enum(preEvalPriorExamValues)).max(preEvalPriorExamValues.length),
  attachmentKeys: z.array(z.string().min(1).max(300)).max(10).optional().default([]),

  alertSigns: z.array(z.enum(preEvalAlertSignValues)).max(preEvalAlertSignValues.length),
  consultationExpectations: z
    .array(z.enum(preEvalConsultationExpectationValues))
    .max(preEvalConsultationExpectationValues.length),

  consentInfoTruthful: z.literal(true, {
    message: 'Debes declarar que la informacion proporcionada es verdadera.',
  }),
  consentUnderstandsNotConsultation: z.literal(true, {
    message: 'Debes confirmar que entiendes que esto no es una consulta medica.',
  }),
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
