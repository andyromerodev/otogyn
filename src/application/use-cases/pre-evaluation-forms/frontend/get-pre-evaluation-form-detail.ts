import type { PreEvaluationFormDetailInput } from '../../../dto/pre-evaluation-form-management'
import type { PreEvaluationFormManagementRepository } from '../../../ports/pre-evaluation-form-management-repository'
import type { PreEvaluationForm } from '../../../../domain/entities/pre-evaluation-form'

export class GetPreEvaluationFormDetailFrontendUseCase {
  constructor(private readonly repository: PreEvaluationFormManagementRepository) {}

  execute(input: PreEvaluationFormDetailInput): Promise<PreEvaluationForm> {
    return this.repository.getFormDetail(input)
  }
}
