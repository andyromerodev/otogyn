import type { DoctorAvailability } from '../../../domain/entities/doctor-availability'
import type { AvailabilityRepository } from '../../../domain/repositories/availability-repository'

export class ToggleAvailabilityActiveUseCase {
  constructor(private readonly availabilityRepository: AvailabilityRepository) {}

  execute(input: { id: string; isActive: boolean }): Promise<DoctorAvailability> {
    return this.availabilityRepository.toggleAvailabilityActive(input.id, input.isActive)
  }
}
