import type { PreEvaluationFormRepository } from '../../../ports/pre-evaluation-form-repository'

export class UploadPreEvaluationAttachmentFrontendUseCase {
  constructor(private readonly preEvaluationFormRepository: PreEvaluationFormRepository) {}

  execute(file: File): Promise<{ key: string }> {
    return this.preEvaluationFormRepository.uploadAttachment(file)
  }
}
