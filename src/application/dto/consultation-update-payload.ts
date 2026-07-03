import type { ConsultationAdditionalExam, ConsultationDiagnosis, ConsultationMedication } from '../../infrastructure/database/schema'

/**
 * Shape of the JSON body accepted by PATCH /api/consultations/[id].
 *
 * This differs from `UpdateConsultationInput` (application/dto/consultation.ts) in one
 * field: `temperature` is sent over the wire as a number (25-45) and the server-side Zod
 * schema transforms it into the persisted string representation. `UpdateConsultationInput`
 * describes the post-transform shape used internally by the use case, not the request body.
 */
export interface ConsultationUpdatePayload {
  anamnesisText?: string | null
  attachmentKeys?: string[]

  bloodPressure?: string | null
  heartRate?: number | null
  respiratoryRate?: number | null
  oxygenSaturation?: number | null
  temperature?: number | null
  additionalExams?: ConsultationAdditionalExam[]

  diagnoses?: ConsultationDiagnosis[]
  appreciation?: string | null

  medications?: ConsultationMedication[]
  treatmentPlan?: string | null
  auxiliaryExams?: string[]
}
