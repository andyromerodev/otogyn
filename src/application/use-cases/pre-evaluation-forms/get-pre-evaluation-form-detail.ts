import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { PreEvaluationForm } from '../../../domain/entities/pre-evaluation-form'
import type { PreEvaluationFormRepository } from '../../../domain/repositories/pre-evaluation-form-repository'

export interface GetPreEvaluationFormDetailInput {
  formId: string
  organizationId: string
}

export class GetPreEvaluationFormDetailUseCase {
  constructor(private readonly preEvaluationFormRepository: PreEvaluationFormRepository) {}

  async execute(input: GetPreEvaluationFormDetailInput): Promise<PreEvaluationForm> {
    const form = await this.preEvaluationFormRepository.findById(input.formId, input.organizationId)

    if (!form) {
      throw new BusinessRuleError('Pre-evaluation form not found.')
    }

    return form
  }
}
