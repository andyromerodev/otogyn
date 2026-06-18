import type { DoctorAvailability } from '../../../domain/entities/doctor-availability'
import type { AvailabilityRepository, SaveAvailabilityInput } from '../../../domain/repositories/availability-repository'

export class CreateAvailabilityUseCase {
  constructor(private readonly availabilityRepository: AvailabilityRepository) {}

  execute(input: SaveAvailabilityInput): Promise<DoctorAvailability> {
    return this.availabilityRepository.saveAvailability(input)
  }
}
