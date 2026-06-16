import type { MedicalService } from '../../../domain/entities/medical-service'
import type { ServiceManagementRepository } from '../../ports/service-management-repository'

export class ListServicesUseCase {
  constructor(private readonly serviceRepository: ServiceManagementRepository) {}

  execute(): Promise<MedicalService[]> {
    return this.serviceRepository.listServices()
  }
}
