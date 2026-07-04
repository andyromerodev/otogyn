import type { TreatmentTemplateRepository } from '../../ports/treatment-template-repository'
import { BusinessRuleError } from '../../../domain/errors/business-rule-error'

export interface DeleteTreatmentTemplateInput {
  id: string
  organizationId: string
}

export class DeleteTreatmentTemplateUseCase {
  constructor(private readonly repository: TreatmentTemplateRepository) {}

  async execute(input: DeleteTreatmentTemplateInput): Promise<void> {
    const deleted = await this.repository.delete(input.id, input.organizationId)

    if (!deleted) {
      throw new BusinessRuleError('Plantilla no encontrada.')
    }
  }
}
