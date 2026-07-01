import type {
  CreatePatientFromFormInput,
  CreatePatientFromFormResult,
  LinkPreEvaluationFormInput,
  ListPreEvaluationFormsInput,
  PreEvaluationFormDetailInput,
  PreEvaluationFormListResult,
} from '../../../application/dto/pre-evaluation-form-management'
import type { PreEvaluationForm } from '../../../domain/entities/pre-evaluation-form'

export interface PreEvaluationFormManagementRemoteDataSource {
  listForms(input: ListPreEvaluationFormsInput): Promise<PreEvaluationFormListResult>
  getFormDetail(input: PreEvaluationFormDetailInput): Promise<PreEvaluationForm>
  linkFormToPatient(input: LinkPreEvaluationFormInput): Promise<PreEvaluationForm>
  createPatientFromForm(input: CreatePatientFromFormInput): Promise<CreatePatientFromFormResult>
}
