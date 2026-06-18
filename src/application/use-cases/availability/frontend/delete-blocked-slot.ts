import type { AvailabilityManagementRepository } from '../../../ports/availability-management-repository'

export class DeleteBlockedSlotFrontendUseCase {
  constructor(private readonly repository: AvailabilityManagementRepository) {}

  execute(id: string): Promise<void> {
    return this.repository.deleteBlockedSlot(id)
  }
}
