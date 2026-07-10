import type { PublicServiceListInput, PublicServiceListResult } from '../../dto/public-booking'
import type { ServiceRepository } from '../../../domain/repositories/service-repository'

export class GetPublicServicesUseCase {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  async execute(input: PublicServiceListInput): Promise<PublicServiceListResult> {
    const page = input.page ?? 1
    const pageSize = Math.min(Math.max(input.pageSize ?? 12, 1), 50)

    const { items, total } = await this.serviceRepository.listPublicServicesPaged({
      organizationId: input.organizationId,
      search: input.search,
      page,
      pageSize,
    })

    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const actualPage = Math.min(Math.max(page, 1), totalPages)

    return {
      items: items.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        defaultDurationMinutes: s.defaultDurationMinutes,
        price: s.price,
      })),
      total,
      page: actualPage,
      pageSize,
      totalPages,
    }
  }
}
