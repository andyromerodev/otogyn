import type {
  ServiceDeleteInput,
  ServiceDetailInput,
  ServiceListResult,
  ServiceMutationInput,
  ServiceScreenContextDto,
  ServiceUpdateInput,
} from '../../../application/dto/service-management'
import type { ServiceManagementRepository } from '../../../application/ports/service-management-repository'
import type { MedicalService } from '../../../domain/entities/medical-service'
import type { ServiceRemoteDataSource } from '../remote/service-remote-data-source'

export class ServiceManagementRepositoryImpl implements ServiceManagementRepository {
  constructor(private readonly remoteDataSource: ServiceRemoteDataSource) {}

  listServices(): Promise<ServiceListResult> {
    return this.remoteDataSource.listServices()
  }

  getServiceDetail(input: ServiceDetailInput): Promise<MedicalService> {
    return this.remoteDataSource.getServiceDetail(input.serviceId)
  }

  createService(input: ServiceMutationInput): Promise<MedicalService> {
    return this.remoteDataSource.createService(input)
  }

  updateService(input: ServiceUpdateInput): Promise<MedicalService> {
    return this.remoteDataSource.updateService(input)
  }

  deleteService(input: ServiceDeleteInput): Promise<void> {
    return this.remoteDataSource.deleteService(input)
  }

  getScreenContext(): Promise<ServiceScreenContextDto> {
    return this.remoteDataSource.getScreenContext()
  }
}
