import type {
  ConsultationAdditionalExam,
  ConsultationDiagnosis,
  ConsultationMedication,
} from '../../infrastructure/database/schema'

export type ConsultationStatus = 'draft' | 'completed'

export interface Consultation {
  id: string
  organizationId: string
  appointmentId: string
  patientId: string
  createdBy: string

  // Anamnesis
  anamnesisText: string | null
  attachmentKeys: string[]

  // Examen físico
  bloodPressure: string | null
  heartRate: number | null
  respiratoryRate: number | null
  oxygenSaturation: number | null
  temperature: string | null
  additionalExams: ConsultationAdditionalExam[]

  // Diagnóstico
  diagnoses: ConsultationDiagnosis[]
  appreciation: string | null

  // Plan
  medications: ConsultationMedication[]
  treatmentPlan: string | null
  auxiliaryExams: string[]

  status: ConsultationStatus
  completedAt: Date | null

  createdAt: Date
  updatedAt: Date
}
