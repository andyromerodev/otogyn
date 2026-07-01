import type {
  CreatePatientFromFormInput,
  CreatePatientFromFormResult,
  LinkPreEvaluationFormInput,
  ListPreEvaluationFormsInput,
  PreEvaluationFormDetailInput,
  PreEvaluationFormListResult,
} from '../../../application/dto/pre-evaluation-form-management'
import type { PreEvaluationFormManagementRepository } from '../../../application/ports/pre-evaluation-form-management-repository'
import type { PreEvaluationForm } from '../../../domain/entities/pre-evaluation-form'
import type { PreEvaluationFormManagementRemoteDataSource } from '../remote/pre-evaluation-form-management-remote-data-source'

export class PreEvaluationFormManagementRepositoryImpl implements PreEvaluationFormManagementRepository {
  constructor(private readonly remoteDataSource: PreEvaluationFormManagementRemoteDataSource) {}

  listForms(input: ListPreEvaluationFormsInput): Promise<PreEvaluationFormListResult> {
    return this.remoteDataSource.listForms(input)
  }

  getFormDetail(input: PreEvaluationFormDetailInput): Promise<PreEvaluationForm> {
    return this.remoteDataSource.getFormDetail(input)
  }

  linkFormToPatient(input: LinkPreEvaluationFormInput): Promise<PreEvaluationForm> {
    return this.remoteDataSource.linkFormToPatient(input)
  }

  createPatientFromForm(input: CreatePatientFromFormInput): Promise<CreatePatientFromFormResult> {
    return this.remoteDataSource.createPatientFromForm(input)
  }
}
