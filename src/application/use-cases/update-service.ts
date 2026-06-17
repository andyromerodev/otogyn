import { BusinessRuleError } from '../../domain/errors/business-rule-error'
import type { MedicalService } from '../../domain/entities/medical-service'
import type { ServiceRepository, UpdateServiceInput } from '../../domain/repositories/service-repository'

export class UpdateServiceUseCase {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  async execute(input: UpdateServiceInput): Promise<MedicalService> {
    const existing = await this.serviceRepository.findById(input.id)

    if (!existing) {
      throw new BusinessRuleError('Service not found.')
    }

    if (input.defaultDurationMinutes !== undefined && input.defaultDurationMinutes <= 0) {
      throw new BusinessRuleError('Service duration must be greater than zero.')
    }

    return this.serviceRepository.update(input)
  }
}
