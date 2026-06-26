import type {
  ServiceDeleteInput,
  ServiceMutationInput,
  ServiceScreenContextDto,
  ServiceUpdateInput,
} from '../../../application/dto/service-management'
import type { MedicalService } from '../../../domain/entities/medical-service'

export interface ServiceRemoteDataSource {
  listServices(): Promise<MedicalService[]>
  getServiceDetail(serviceId: string): Promise<MedicalService>
  createService(input: ServiceMutationInput): Promise<MedicalService>
  updateService(input: ServiceUpdateInput): Promise<MedicalService>
  deleteService(input: ServiceDeleteInput): Promise<void>
  getScreenContext(): Promise<ServiceScreenContextDto>
}
