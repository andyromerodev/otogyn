import type { PreEvaluationFormManagementRepository } from '../../../ports/pre-evaluation-form-management-repository'

export class DeletePreEvaluationFormFrontendUseCase {
  constructor(private readonly repository: PreEvaluationFormManagementRepository) {}

  execute(id: string): Promise<void> {
    return this.repository.deleteForm(id)
  }
}
