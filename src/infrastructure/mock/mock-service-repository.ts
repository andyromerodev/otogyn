import type { MedicalService } from '../../domain/entities/medical-service'
import type { ServiceRepository, UpdateServiceInput } from '../../domain/repositories/service-repository'

export class MockServiceRepository implements ServiceRepository {
  constructor(private readonly services: MedicalService[]) {}

  async listByOrganization(organizationId: string, search = ''): Promise<MedicalService[]> {
    const trimmedSearch = search.trim().toLowerCase()

    return this.services.filter((service) =>
      service.organizationId === organizationId &&
      (!trimmedSearch || service.name.toLowerCase().includes(trimmedSearch)))
  }

  async findById(id: string): Promise<MedicalService | null> {
    return this.services.find((service) => service.id === id) ?? null
  }

  async create(service: MedicalService): Promise<MedicalService> {
    this.services.push(service)
    return service
  }

  async update(input: UpdateServiceInput): Promise<MedicalService> {
    const index = this.services.findIndex((service) => service.id === input.id)

    if (index === -1) {
      throw new Error('Service not found')
    }

    const now = new Date()
    const existing = this.services[index]!

    this.services[index] = {
      ...existing,
      name: input.name ?? existing.name,
      description: input.description !== undefined ? input.description : existing.description,
      defaultDurationMinutes: input.defaultDurationMinutes ?? existing.defaultDurationMinutes,
      price: input.price !== undefined ? input.price : existing.price,
      isActive: input.isActive ?? existing.isActive,
      updatedAt: now,
    }

    return this.services[index]!
  }

  async delete(id: string): Promise<void> {
    const index = this.services.findIndex((service) => service.id === id)

    if (index === -1) {
      throw new Error('Service not found')
    }

    this.services.splice(index, 1)
  }
}
