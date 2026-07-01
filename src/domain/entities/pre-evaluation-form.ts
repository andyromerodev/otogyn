export type PreEvalSymptomDuration = 'lt_1mo' | '1_3mo' | '3_12mo' | 'gt_1yr'
export type PreEvalSymptomPattern = 'constant' | 'intermittent' | 'worsening'
export type PreEvalYesNo = 'yes' | 'no'
export type PreEvalImprovement = 'yes' | 'partial' | 'no'
export type PreEvalStatus = 'pending_review' | 'reviewed' | 'scheduled' | 'dismissed'

export interface PreEvaluationForm {
  id: string
  organizationId: string
  patientId: string | null

  fullName: string
  age: number | null
  city: string | null
  phone: string
  email: string | null

  mainReasons: string[]
  mainReasonOtherText: string | null
  complaintDescription: string | null

  symptomDuration: PreEvalSymptomDuration | null
  symptomPattern: PreEvalSymptomPattern | null

  associatedSymptoms: string[]
  aggravatingFactors: string[]

  hasPriorRefluxDiagnosis: PreEvalYesNo | null
  hasPriorTreatment: PreEvalYesNo | null
  priorMedicationUsed: string | null
  treatmentImprovement: PreEvalImprovement | null

  priorExams: string[]
  attachmentKeys: string[]

  alertSigns: string[]
  consultationExpectations: string[]

  consentInfoTruthful: boolean
  consentUnderstandsNotConsultation: boolean

  status: PreEvalStatus

  createdAt: Date
  updatedAt: Date
}
