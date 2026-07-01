import type {
  ListPreEvaluationFormsInput,
  PreEvaluationFormListResult,
} from '../../../dto/pre-evaluation-form-management'
import type { PreEvaluationFormManagementRepository } from '../../../ports/pre-evaluation-form-management-repository'

export class ListPreEvaluationFormsFrontendUseCase {
  constructor(private readonly repository: PreEvaluationFormManagementRepository) {}

  execute(input: ListPreEvaluationFormsInput): Promise<PreEvaluationFormListResult> {
    return this.repository.listForms(input)
  }
}
