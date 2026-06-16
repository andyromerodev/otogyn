import type {
  ServiceListResult,
  ServiceMutationInput,
  ServiceScreenContextDto,
} from '../../../application/dto/service-management'
import type { ServiceManagementRepository } from '../../../application/ports/service-management-repository'
import type { MedicalService } from '../../../domain/entities/medical-service'
import type { ServiceRemoteDataSource } from '../remote/service-remote-data-source'

export class ServiceManagementRepositoryImpl implements ServiceManagementRepository {
  constructor(private readonly remoteDataSource: ServiceRemoteDataSource) {}

  listServices(): Promise<ServiceListResult> {
    return this.remoteDataSource.listServices()
  }

  createService(input: ServiceMutationInput): Promise<MedicalService> {
    return this.remoteDataSource.createService(input)
  }

  getScreenContext(): Promise<ServiceScreenContextDto> {
    return this.remoteDataSource.getScreenContext()
  }
}
