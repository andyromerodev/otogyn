import type {
  PreEvalImprovement,
  PreEvalSymptomDuration,
  PreEvalSymptomPattern,
  PreEvalYesNo,
} from '../../domain/entities/pre-evaluation-form'

export interface CreatePreEvaluationFormInput {
  fullName: string
  age?: number | null
  city?: string | null
  phone: string
  email?: string | null

  mainReasons: string[]
  mainReasonOtherText?: string | null
  complaintDescription?: string | null

  symptomDuration?: PreEvalSymptomDuration | null
  symptomPattern?: PreEvalSymptomPattern | null

  associatedSymptoms: string[]
  aggravatingFactors: string[]

  hasPriorRefluxDiagnosis?: PreEvalYesNo | null
  hasPriorTreatment?: PreEvalYesNo | null
  priorMedicationUsed?: string | null
  treatmentImprovement?: PreEvalImprovement | null

  priorExams: string[]
  attachmentKeys?: string[]

  alertSigns: string[]
  consultationExpectations: string[]

  consentInfoTruthful: true
  consentUnderstandsNotConsultation: true
}

export interface CreatePreEvaluationFormResult {
  id: string
}
