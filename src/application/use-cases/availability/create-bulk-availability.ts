import type { DoctorAvailability } from '../../../domain/entities/doctor-availability'
import type { AvailabilityRepository, SaveAvailabilityInput } from '../../../domain/repositories/availability-repository'

export class CreateBulkAvailabilityUseCase {
  constructor(private readonly availabilityRepository: AvailabilityRepository) {}

  execute(inputs: SaveAvailabilityInput[]): Promise<DoctorAvailability[]> {
    return this.availabilityRepository.saveBulkAvailability(inputs)
  }
}
