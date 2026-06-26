import type {
  ServiceDeleteInput,
  ServiceDetailInput,
  ServiceListResult,
  ServiceMutationInput,
  ServiceScreenContextDto,
  ServiceUpdateInput,
} from '../dto/service-management'
import type { MedicalService } from '../../domain/entities/medical-service'

export interface ServiceManagementRepository {
  listServices(): Promise<ServiceListResult>
  getServiceDetail(input: ServiceDetailInput): Promise<MedicalService>
  createService(input: ServiceMutationInput): Promise<MedicalService>
  updateService(input: ServiceUpdateInput): Promise<MedicalService>
  deleteService(input: ServiceDeleteInput): Promise<void>
  getScreenContext(): Promise<ServiceScreenContextDto>
}
