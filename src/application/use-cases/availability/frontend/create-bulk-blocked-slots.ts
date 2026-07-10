import type { BlockedTimeSlot } from '../../../../domain/entities/blocked-time-slot'
import type { BlockedSlotBulkMutationInput } from '../../../dto/availability-management'
import type { AvailabilityManagementRepository } from '../../../ports/availability-management-repository'

export class CreateBulkBlockedSlotsFrontendUseCase {
  constructor(private readonly repository: AvailabilityManagementRepository) {}

  execute(input: BlockedSlotBulkMutationInput): Promise<BlockedTimeSlot[]> {
    return this.repository.createBulkBlockedSlots(input)
  }
}
