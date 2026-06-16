import type { MedicalService } from '../../../domain/entities/medical-service'
import type { ServiceMutationInput } from '../../dto/service-management'
import type { ServiceManagementRepository } from '../../ports/service-management-repository'

export class CreateServiceUseCase {
  constructor(private readonly serviceRepository: ServiceManagementRepository) {}

  execute(input: ServiceMutationInput): Promise<MedicalService> {
    return this.serviceRepository.createService({
      name: input.name.trim(),
      description: input.description ?? null,
      defaultDurationMinutes: input.defaultDurationMinutes,
      price: input.price ?? null,
      isActive: input.isActive ?? true,
    })
  }
}
