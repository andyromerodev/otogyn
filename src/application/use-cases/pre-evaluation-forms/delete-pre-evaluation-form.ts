import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { PreEvaluationFormRepository } from '../../../domain/repositories/pre-evaluation-form-repository'

export interface DeletePreEvaluationFormInput {
  formId: string
  organizationId: string
}

export class DeletePreEvaluationFormUseCase {
  constructor(private readonly preEvaluationFormRepository: PreEvaluationFormRepository) {}

  async execute(input: DeletePreEvaluationFormInput): Promise<void> {
    const form = await this.preEvaluationFormRepository.findById(input.formId, input.organizationId)

    if (!form) {
      throw new BusinessRuleError('Pre-evaluation form not found.')
    }

    await this.preEvaluationFormRepository.delete(input.formId, input.organizationId)
  }
}
