import type {
  ServiceMutationInput,
  ServiceScreenContextDto,
} from '../../../application/dto/service-management'
import type { MedicalService } from '../../../domain/entities/medical-service'

export interface ServiceRemoteDataSource {
  listServices(): Promise<MedicalService[]>
  createService(input: ServiceMutationInput): Promise<MedicalService>
  getScreenContext(): Promise<ServiceScreenContextDto>
}
