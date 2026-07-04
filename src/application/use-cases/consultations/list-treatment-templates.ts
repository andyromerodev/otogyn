import type { TreatmentTemplate, ListTreatmentTemplatesInput } from '../../dto/consultation'
import type { TreatmentTemplateRepository } from '../../ports/treatment-template-repository'

export class ListTreatmentTemplatesUseCase {
  constructor(private readonly repository: TreatmentTemplateRepository) {}

  async execute(input: ListTreatmentTemplatesInput): Promise<TreatmentTemplate[]> {
    return this.repository.list(input.organizationId, input.diagnosisCode)
  }
}
