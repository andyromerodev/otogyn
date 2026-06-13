import type { MedicalService } from '../../domain/entities/medical-service'
import type { ServiceRepository } from '../../domain/repositories/service-repository'

export class ListServicesUseCase {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  execute(input: { organizationId: string }): Promise<MedicalService[]> {
    return this.serviceRepository.listByOrganization(input.organizationId)
  }
}
