import { BusinessRuleError } from '../../domain/errors/business-rule-error'
import type { ServiceRepository } from '../../domain/repositories/service-repository'

export interface DeleteServiceInput {
  serviceId: string
  organizationId: string
}

export class DeleteServiceUseCase {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  async execute(input: DeleteServiceInput): Promise<void> {
    const existing = await this.serviceRepository.findById(input.serviceId)

    if (!existing || existing.organizationId !== input.organizationId) {
      throw new BusinessRuleError('Service not found.')
    }

    await this.serviceRepository.delete(input.serviceId)
  }
}
