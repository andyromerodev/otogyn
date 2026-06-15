import type { MedicalService } from '../../domain/entities/medical-service'
import type { ServiceRepository } from '../../domain/repositories/service-repository'

export class MockServiceRepository implements ServiceRepository {
  constructor(private readonly services: MedicalService[]) {}

  async listByOrganization(organizationId: string): Promise<MedicalService[]> {
    return this.services.filter((service) => service.organizationId === organizationId)
  }

  async findById(id: string): Promise<MedicalService | null> {
    return this.services.find((service) => service.id === id) ?? null
  }

  async create(service: MedicalService): Promise<MedicalService> {
    this.services.push(service)
    return service
  }
}
