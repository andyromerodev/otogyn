import type { BlockedTimeSlot } from '../../../domain/entities/blocked-time-slot'
import type { AvailabilityRepository, CreateBlockedSlotInput } from '../../../domain/repositories/availability-repository'

export class CreateBulkBlockedSlotsUseCase {
  constructor(private readonly availabilityRepository: AvailabilityRepository) {}

  execute(inputs: CreateBlockedSlotInput[]): Promise<BlockedTimeSlot[]> {
    return this.availabilityRepository.createBulkBlockedSlots(inputs)
  }
}
