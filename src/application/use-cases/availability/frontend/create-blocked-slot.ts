import type { BlockedTimeSlot } from '../../../../domain/entities/blocked-time-slot'
import type { BlockedSlotMutationInput } from '../../../dto/availability-management'
import type { AvailabilityManagementRepository } from '../../../ports/availability-management-repository'

export class CreateBlockedSlotFrontendUseCase {
  constructor(private readonly repository: AvailabilityManagementRepository) {}

  execute(input: BlockedSlotMutationInput): Promise<BlockedTimeSlot> {
    return this.repository.createBlockedSlot(input)
  }
}
