import type { BlockedTimeSlot } from '../../../domain/entities/blocked-time-slot'
import type { AvailabilityRepository } from '../../../domain/repositories/availability-repository'

export class ListUpcomingBlockedSlotsUseCase {
  constructor(private readonly availabilityRepository: AvailabilityRepository) {}

  execute(input: { organizationId: string; limit?: number }): Promise<BlockedTimeSlot[]> {
    return this.availabilityRepository.listUpcomingBlockedSlots(input.organizationId, input.limit)
  }
}
