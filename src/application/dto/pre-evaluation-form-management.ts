import type { Patient } from '../../domain/entities/patient'
import type { PreEvaluationForm } from '../../domain/entities/pre-evaluation-form'
import type { PreEvaluationFormListFilter } from '../../domain/repositories/pre-evaluation-form-repository'

export interface ListPreEvaluationFormsInput {
  search?: string
  filter?: PreEvaluationFormListFilter
  page?: number
  pageSize?: number
}

export interface PreEvaluationFormListResult {
  items: PreEvaluationForm[]
  total: number
  allTotal: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PreEvaluationFormDetailInput {
  formId: string
}

export interface LinkPreEvaluationFormInput {
  formId: string
  patientId: string
}

export interface CreatePatientFromFormInput {
  formId: string
}

export interface CreatePatientFromFormResult {
  patient: Patient
  form: PreEvaluationForm
}
