import type {
  CreatePatientFromFormInput,
  CreatePatientFromFormResult,
} from '../../../dto/pre-evaluation-form-management'
import type { PreEvaluationFormManagementRepository } from '../../../ports/pre-evaluation-form-management-repository'

export class CreatePatientFromPreEvaluationFormFrontendUseCase {
  constructor(private readonly repository: PreEvaluationFormManagementRepository) {}

  execute(input: CreatePatientFromFormInput): Promise<CreatePatientFromFormResult> {
    return this.repository.createPatientFromForm(input)
  }
}
