import type { BlockedTimeSlot } from '../../../domain/entities/blocked-time-slot'
import type { AvailabilityRepository } from '../../../domain/repositories/availability-repository'

export class ListBlockedSlotsUseCase {
  constructor(private readonly availabilityRepository: AvailabilityRepository) {}

  execute(input: { organizationId: string; day: Date }): Promise<BlockedTimeSlot[]> {
    return this.availabilityRepository.listBlockedSlots(input.organizationId, input.day)
  }
}
