import type {
  CreatePatientFromFormInput,
  CreatePatientFromFormResult,
  LinkPreEvaluationFormInput,
  ListPreEvaluationFormsInput,
  PreEvaluationFormDetailInput,
  PreEvaluationFormListResult,
} from '../../../application/dto/pre-evaluation-form-management'
import type { PreEvaluationForm } from '../../../domain/entities/pre-evaluation-form'
import type { PreEvaluationFormManagementRemoteDataSource } from './pre-evaluation-form-management-remote-data-source'

export class HttpPreEvaluationFormManagementRemoteDataSource
  implements PreEvaluationFormManagementRemoteDataSource
{
  async listForms(input: ListPreEvaluationFormsInput): Promise<PreEvaluationFormListResult> {
    const query = {
      search: input.search?.trim() || undefined,
      filter: input.filter ?? 'all',
      page: input.page ?? 1,
      pageSize: input.pageSize ?? 10,
    }

    if (import.meta.server) {
      const requestFetch = useRequestFetch() as (request: string, options?: Record<string, unknown>) => Promise<unknown>
      return await requestFetch('/api/pre-evaluation-forms', { query }) as PreEvaluationFormListResult
    }

    return $fetch<PreEvaluationFormListResult>('/api/pre-evaluation-forms', { query })
  }

  async getFormDetail(input: PreEvaluationFormDetailInput): Promise<PreEvaluationForm> {
    if (import.meta.server) {
      const requestFetch = useRequestFetch() as (request: string, options?: Record<string, unknown>) => Promise<unknown>
      return await requestFetch(`/api/pre-evaluation-forms/${input.formId}`) as PreEvaluationForm
    }

    return $fetch<PreEvaluationForm>(`/api/pre-evaluation-forms/${input.formId}`)
  }

  async linkFormToPatient(input: LinkPreEvaluationFormInput): Promise<PreEvaluationForm> {
    const body = { patientId: input.patientId }

    if (import.meta.server) {
      const requestFetch = useRequestFetch() as (request: string, options?: Record<string, unknown>) => Promise<unknown>
      return await requestFetch(`/api/pre-evaluation-forms/${input.formId}/link`, {
        method: 'POST',
        body,
      }) as PreEvaluationForm
    }

    return $fetch<PreEvaluationForm>(`/api/pre-evaluation-forms/${input.formId}/link`, {
      method: 'POST',
      body,
    })
  }

  async createPatientFromForm(input: CreatePatientFromFormInput): Promise<CreatePatientFromFormResult> {
    if (import.meta.server) {
      const requestFetch = useRequestFetch() as (request: string, options?: Record<string, unknown>) => Promise<unknown>
      return await requestFetch(`/api/pre-evaluation-forms/${input.formId}/create-patient`, {
        method: 'POST',
      }) as CreatePatientFromFormResult
    }

    return $fetch<CreatePatientFromFormResult>(`/api/pre-evaluation-forms/${input.formId}/create-patient`, {
      method: 'POST',
    })
  }
}
