import type {
  ServiceMutationInput,
  ServiceScreenContextDto,
} from '../../../application/dto/service-management'
import type { MedicalService } from '../../../domain/entities/medical-service'
import type { ServiceRemoteDataSource } from './service-remote-data-source'

export class HttpServiceRemoteDataSource implements ServiceRemoteDataSource {
  async listServices(): Promise<MedicalService[]> {
    return $fetch<MedicalService[]>('/api/services')
  }

  async createService(input: ServiceMutationInput): Promise<MedicalService> {
    return $fetch<MedicalService>('/api/services', {
      method: 'POST',
      body: input,
    })
  }

  async getScreenContext(): Promise<ServiceScreenContextDto> {
    return $fetch<ServiceScreenContextDto>('/api/auth/session-context')
  }
}
