import type { MedicalService } from '../../domain/entities/medical-service'
import type { ServiceRepository } from '../../domain/repositories/service-repository'

export interface GetServiceDetailInput {
  serviceId: string
  organizationId: string
}

export class GetServiceDetailUseCase {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  async execute(input: GetServiceDetailInput): Promise<MedicalService | null> {
    const service = await this.serviceRepository.findById(input.serviceId)

    if (!service || service.organizationId !== input.organizationId) {
      return null
    }

    return service
  }
}
