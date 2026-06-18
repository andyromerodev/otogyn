import type { DoctorAvailability } from '../../../domain/entities/doctor-availability'
import type { AvailabilityRepository } from '../../../domain/repositories/availability-repository'

export class ListAvailabilityUseCase {
  constructor(private readonly availabilityRepository: AvailabilityRepository) {}

  execute(input: { organizationId: string }): Promise<DoctorAvailability[]> {
    return this.availabilityRepository.listWeeklyAvailability(input.organizationId)
  }
}
