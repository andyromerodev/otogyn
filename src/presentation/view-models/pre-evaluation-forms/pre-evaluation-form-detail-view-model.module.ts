import type {
  CreatePatientFromFormInput,
  CreatePatientFromFormResult,
  LinkPreEvaluationFormInput,
  PreEvaluationFormDetailInput,
} from '../../../application/dto/pre-evaluation-form-management'
import type { ListPatientsInput, PatientDetailInput, PatientListResult } from '../../../application/dto/patient-management'
import type { Patient } from '../../../domain/entities/patient'
import type { PreEvaluationForm } from '../../../domain/entities/pre-evaluation-form'

export interface PreEvaluationFormDetailViewModelDependencies {
  formId: string
  getPreEvaluationFormDetailUseCase: { execute(input: PreEvaluationFormDetailInput): Promise<PreEvaluationForm> }
  linkPreEvaluationFormToPatientUseCase: { execute(input: LinkPreEvaluationFormInput): Promise<PreEvaluationForm> }
  createPatientFromPreEvaluationFormUseCase: {
    execute(input: CreatePatientFromFormInput): Promise<CreatePatientFromFormResult>
  }
  listPatientsUseCase: { execute(input: ListPatientsInput): Promise<PatientListResult> }
  getPatientDetailUseCase: { execute(input: PatientDetailInput): Promise<Patient> }
}
