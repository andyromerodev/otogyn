import type { ServiceDeleteInput } from '../../dto/service-management'
import type { ServiceManagementRepository } from '../../ports/service-management-repository'

export class DeleteServiceUseCase {
  constructor(private readonly serviceManagementRepository: ServiceManagementRepository) {}

  execute(input: ServiceDeleteInput): Promise<void> {
    return this.serviceManagementRepository.deleteService(input)
  }
}
