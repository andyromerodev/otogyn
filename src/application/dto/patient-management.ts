import type { Patient } from '../../domain/entities/patient'

export interface PatientMutationInput {
  fullName: string
  phone: string
  email?: string | null
  birthDate?: string | null
  documentId?: string | null
  administrativeNotes?: string | null
}

export interface PatientDetailInput {
  patientId: string
}

export interface UpdatePatientDetailInput extends PatientMutationInput {
  patientId: string
}

export type PatientListResult = Patient[]
