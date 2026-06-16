import type { ServiceScreenContextDto } from '../../dto/service-management'
import type { ServiceManagementRepository } from '../../ports/service-management-repository'

export class GetServiceScreenContextUseCase {
  constructor(private readonly serviceRepository: ServiceManagementRepository) {}

  execute(): Promise<ServiceScreenContextDto> {
    return this.serviceRepository.getScreenContext()
  }
}
