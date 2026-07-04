import type { TreatmentTemplate, CreateTreatmentTemplateInput } from '../../dto/consultation'
import type { TreatmentTemplateRepository } from '../../ports/treatment-template-repository'

export class CreateTreatmentTemplateUseCase {
  constructor(private readonly repository: TreatmentTemplateRepository) {}

  async execute(input: CreateTreatmentTemplateInput): Promise<TreatmentTemplate> {
    return this.repository.create(input)
  }
}
