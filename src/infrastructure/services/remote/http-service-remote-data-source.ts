import type {
  ServiceDeleteInput,
  ServiceMutationInput,
  ServiceScreenContextDto,
  ServiceUpdateInput,
} from '../../../application/dto/service-management'
import type { MedicalService } from '../../../domain/entities/medical-service'
import type { ServiceRemoteDataSource } from './service-remote-data-source'

export class HttpServiceRemoteDataSource implements ServiceRemoteDataSource {
  async listServices(): Promise<MedicalService[]> {
    return $fetch<MedicalService[]>('/api/services')
  }

  async getServiceDetail(serviceId: string): Promise<MedicalService> {
    return $fetch<MedicalService>(`/api/services/${serviceId}`)
  }

  async createService(input: ServiceMutationInput): Promise<MedicalService> {
    return $fetch<MedicalService>('/api/services', {
      method: 'POST',
      body: input,
    })
  }

  async updateService(input: ServiceUpdateInput): Promise<MedicalService> {
    return $fetch<MedicalService>(`/api/services/${input.id}`, {
      method: 'PATCH',
      body: {
        name: input.name,
        description: input.description,
        defaultDurationMinutes: input.defaultDurationMinutes,
        price: input.price,
        isActive: input.isActive,
      },
    })
  }

  async deleteService(input: ServiceDeleteInput): Promise<void> {
    await $fetch(`/api/services/${input.serviceId}`, {
      method: 'DELETE',
    })
  }

  async getScreenContext(): Promise<ServiceScreenContextDto> {
    return $fetch<ServiceScreenContextDto>('/api/auth/session-context')
  }
}
