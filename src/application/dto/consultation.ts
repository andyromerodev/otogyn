import type {
  ConsultationAdditionalExam,
  ConsultationDiagnosis,
  ConsultationMedication,
} from '../../infrastructure/database/schema'
import type { Consultation, ConsultationStatus } from '../../domain/entities/consultation'

export interface StartConsultationInput {
  appointmentId: string
  organizationId: string
  userId: string
}

export interface UpdateConsultationInput {
  anamnesisText?: string | null
  attachmentKeys?: string[]

  bloodPressure?: string | null
  heartRate?: number | null
  respiratoryRate?: number | null
  oxygenSaturation?: number | null
  temperature?: string | null
  additionalExams?: ConsultationAdditionalExam[]

  diagnoses?: ConsultationDiagnosis[]
  appreciation?: string | null

  medications?: ConsultationMedication[]
  treatmentPlan?: string | null
  auxiliaryExams?: string[]
}

export type ConsultationDetail = Consultation

export interface TreatmentTemplate {
  id: string
  organizationId: string
  name: string
  diagnosisCode: string | null
  diagnosisLabel: string | null
  treatmentPlan: string
  medications: ConsultationMedication[]
  auxiliaryExams: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateTreatmentTemplateInput {
  organizationId: string
  name: string
  diagnosisCode?: string | null
  diagnosisLabel?: string | null
  treatmentPlan: string
  medications: ConsultationMedication[]
  auxiliaryExams: string[]
}

export interface ListTreatmentTemplatesInput {
  organizationId: string
  diagnosisCode?: string
}

export interface PatientConsultationHistoryItem {
  id: string
  appointmentId: string
  createdAt: Date
  completedAt: Date | null
  status: ConsultationStatus
  diagnoses: ConsultationDiagnosis[]
}
