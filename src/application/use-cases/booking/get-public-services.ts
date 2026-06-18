import type { PublicServiceDto } from '../../dto/public-booking'
import type { ServiceRepository } from '../../../domain/repositories/service-repository'

export class GetPublicServicesUseCase {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  async execute(input: { organizationId: string }): Promise<PublicServiceDto[]> {
    const all = await this.serviceRepository.listByOrganization(input.organizationId)

    return all
      .filter((s) => s.isActive)
      .map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        defaultDurationMinutes: s.defaultDurationMinutes,
        price: s.price,
      }))
  }
}
