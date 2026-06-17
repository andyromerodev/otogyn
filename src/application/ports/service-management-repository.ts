import type {
  ServiceListResult,
  ServiceMutationInput,
  ServiceScreenContextDto,
  ServiceUpdateInput,
} from '../dto/service-management'
import type { MedicalService } from '../../domain/entities/medical-service'

export interface ServiceManagementRepository {
  listServices(): Promise<ServiceListResult>
  createService(input: ServiceMutationInput): Promise<MedicalService>
  updateService(input: ServiceUpdateInput): Promise<MedicalService>
  getScreenContext(): Promise<ServiceScreenContextDto>
}
