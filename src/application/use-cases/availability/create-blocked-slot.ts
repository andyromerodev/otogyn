import type { BlockedTimeSlot } from '../../../domain/entities/blocked-time-slot'
import type { AvailabilityRepository, CreateBlockedSlotInput } from '../../../domain/repositories/availability-repository'

export class CreateBlockedSlotUseCase {
  constructor(private readonly availabilityRepository: AvailabilityRepository) {}

  execute(input: CreateBlockedSlotInput): Promise<BlockedTimeSlot> {
    return this.availabilityRepository.createBlockedSlot(input)
  }
}
