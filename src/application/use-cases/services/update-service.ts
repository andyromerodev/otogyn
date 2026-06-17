import type { MedicalService } from '../../../domain/entities/medical-service'
import type { ServiceUpdateInput } from '../../dto/service-management'
import type { ServiceManagementRepository } from '../../ports/service-management-repository'

export class UpdateServiceUseCase {
  constructor(private readonly serviceRepository: ServiceManagementRepository) {}

  execute(input: ServiceUpdateInput): Promise<MedicalService> {
    return this.serviceRepository.updateService(input)
  }
}
