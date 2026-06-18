import type { DoctorAvailability } from '../../../../domain/entities/doctor-availability'
import type { AvailabilityUpdateInput } from '../../../dto/availability-management'
import type { AvailabilityManagementRepository } from '../../../ports/availability-management-repository'

export class UpdateAvailabilityFrontendUseCase {
  constructor(private readonly repository: AvailabilityManagementRepository) {}

  execute(input: AvailabilityUpdateInput): Promise<DoctorAvailability> {
    return this.repository.updateAvailability(input)
  }
}
