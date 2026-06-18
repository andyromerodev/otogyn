import type { AvailabilityRepository } from '../../../domain/repositories/availability-repository'

export class DeleteBlockedSlotUseCase {
  constructor(private readonly availabilityRepository: AvailabilityRepository) {}

  execute(input: { id: string }): Promise<void> {
    return this.availabilityRepository.deleteBlockedSlot(input.id)
  }
}
