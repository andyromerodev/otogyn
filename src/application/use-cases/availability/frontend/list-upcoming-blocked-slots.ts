import type { BlockedTimeSlot } from '../../../../domain/entities/blocked-time-slot'
import type { AvailabilityManagementRepository } from '../../../ports/availability-management-repository'

export class ListUpcomingBlockedSlotsFrontendUseCase {
  constructor(private readonly repository: AvailabilityManagementRepository) {}

  execute(): Promise<BlockedTimeSlot[]> {
    return this.repository.listUpcomingBlockedSlots()
  }
}
