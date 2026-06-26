import type { MedicalService } from '../../../domain/entities/medical-service'
import type { ServiceDetailInput } from '../../dto/service-management'
import type { ServiceManagementRepository } from '../../ports/service-management-repository'

export class GetServiceDetailUseCase {
  constructor(private readonly serviceRepository: ServiceManagementRepository) {}

  execute(input: ServiceDetailInput): Promise<MedicalService> {
    return this.serviceRepository.getServiceDetail(input)
  }
}
