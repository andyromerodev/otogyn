import type { DoctorAvailability } from '../../../../domain/entities/doctor-availability'
import type { AvailabilityBulkMutationInput } from '../../../dto/availability-management'
import type { AvailabilityManagementRepository } from '../../../ports/availability-management-repository'

export class CreateBulkAvailabilityFrontendUseCase {
  constructor(private readonly repository: AvailabilityManagementRepository) {}

  execute(input: AvailabilityBulkMutationInput): Promise<DoctorAvailability[]> {
    return this.repository.createBulkAvailability(input)
  }
}
