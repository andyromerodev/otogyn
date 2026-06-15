import { BusinessRuleError } from '../../domain/errors/business-rule-error'
import type { MedicalService } from '../../domain/entities/medical-service'
import type { ServiceRepository } from '../../domain/repositories/service-repository'

export interface CreateServiceInput {
  organizationId: string
  name: string
  description?: string | null
  defaultDurationMinutes: number
  price?: number | null
  isActive?: boolean
}

export class CreateServiceUseCase {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  async execute(input: CreateServiceInput): Promise<MedicalService> {
    if (input.defaultDurationMinutes <= 0) {
      throw new BusinessRuleError('Service duration must be greater than zero.')
    }

    const now = new Date()

    return this.serviceRepository.create({
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      name: input.name.trim(),
      description: input.description ?? null,
      defaultDurationMinutes: input.defaultDurationMinutes,
      price: input.price ?? null,
      isActive: input.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    })
  }
}
