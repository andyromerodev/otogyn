import type {
  PreEvalImprovement,
  PreEvalSymptomDuration,
  PreEvalSymptomPattern,
  PreEvalYesNo,
} from '../../domain/entities/pre-evaluation-form'

export interface CreatePreEvaluationFormInput {
  // Seccion 1: Datos del paciente
  fullName: string
  birthDate?: string | null
  residenceCityCountry?: string | null
  phone: string
  email?: string | null

  // Seccion 2: Motivo de consulta
  complaintDescription?: string | null
  symptomDurationText?: string | null
  medicalHistory?: string | null

  // Seccion 3: Documentacion medica
  previousTreatmentsAndExams?: string | null
  attachmentKeys?: string[]

  // Seccion 4: Confirmacion y consentimiento
  understandsVirtualConditions?: boolean
  consentPrivacyPolicy?: boolean

  // Campos heredados/retrocompatibles
  age?: number | null
  city?: string | null
  mainReasons?: string[]
  mainReasonOtherText?: string | null
  symptomDuration?: PreEvalSymptomDuration | null
  symptomPattern?: PreEvalSymptomPattern | null
  associatedSymptoms?: string[]
  aggravatingFactors?: string[]
  hasPriorRefluxDiagnosis?: PreEvalYesNo | null
  hasPriorTreatment?: PreEvalYesNo | null
  priorMedicationUsed?: string | null
  treatmentImprovement?: PreEvalImprovement | null
  priorExams?: string[]
  alertSigns?: string[]
  consultationExpectations?: string[]
  consentInfoTruthful?: boolean
  consentUnderstandsNotConsultation?: boolean
  publicSecurityToken?: string
  website?: string | null
}

export interface CreatePreEvaluationFormResult {
  id: string
}
