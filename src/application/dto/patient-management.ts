import type { PatientListFilter, PatientListItem } from '../../domain/repositories/patient-repository'

export interface PatientMutationInput {
  fullName: string
  phone: string
  email?: string | null
  birthDate?: string | null
  documentId?: string | null
  administrativeNotes?: string | null
  isUrgent?: boolean
}

export interface PatientDetailInput {
  patientId: string
}

export interface UpdatePatientDetailInput extends PatientMutationInput {
  patientId: string
}

export interface ListPatientsInput {
  search?: string
  filter?: PatientListFilter
  page?: number
  pageSize?: number
}

export interface PatientListResult {
  items: PatientListItem[]
  total: number
  allTotal: number
  page: number
  pageSize: number
  totalPages: number
}
