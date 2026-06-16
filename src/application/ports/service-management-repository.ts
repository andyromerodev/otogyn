import type {
  ServiceListResult,
  ServiceMutationInput,
  ServiceScreenContextDto,
} from '../dto/service-management'
import type { MedicalService } from '../../domain/entities/medical-service'

export interface ServiceManagementRepository {
  listServices(): Promise<ServiceListResult>
  createService(input: ServiceMutationInput): Promise<MedicalService>
  getScreenContext(): Promise<ServiceScreenContextDto>
}
