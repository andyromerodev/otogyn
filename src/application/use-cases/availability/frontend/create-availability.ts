import type { DoctorAvailability } from '../../../../domain/entities/doctor-availability'
import type { AvailabilityMutationInput } from '../../../dto/availability-management'
import type { AvailabilityManagementRepository } from '../../../ports/availability-management-repository'

export class CreateAvailabilityFrontendUseCase {
  constructor(private readonly repository: AvailabilityManagementRepository) {}

  execute(input: AvailabilityMutationInput): Promise<DoctorAvailability> {
    return this.repository.createAvailability(input)
  }
}
