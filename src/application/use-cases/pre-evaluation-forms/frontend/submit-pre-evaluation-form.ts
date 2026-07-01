import type { CreatePreEvaluationFormInput, CreatePreEvaluationFormResult } from '../../../dto/pre-evaluation-form'
import type { PreEvaluationFormRepository } from '../../../ports/pre-evaluation-form-repository'

export class SubmitPreEvaluationFormFrontendUseCase {
  constructor(private readonly preEvaluationFormRepository: PreEvaluationFormRepository) {}

  execute(input: CreatePreEvaluationFormInput): Promise<CreatePreEvaluationFormResult> {
    return this.preEvaluationFormRepository.submit(input)
  }
}
