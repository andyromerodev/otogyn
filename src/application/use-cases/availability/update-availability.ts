import type { DoctorAvailability } from '../../../domain/entities/doctor-availability'
import type { AvailabilityRepository, UpdateAvailabilityInput } from '../../../domain/repositories/availability-repository'

export class UpdateAvailabilityUseCase {
  constructor(private readonly availabilityRepository: AvailabilityRepository) {}

  execute(id: string, input: UpdateAvailabilityInput): Promise<DoctorAvailability> {
    return this.availabilityRepository.updateAvailability(id, input)
  }
}
