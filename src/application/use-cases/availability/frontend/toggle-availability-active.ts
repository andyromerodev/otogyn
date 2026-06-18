import type { DoctorAvailability } from '../../../../domain/entities/doctor-availability'
import type { AvailabilityManagementRepository } from '../../../ports/availability-management-repository'

export class ToggleAvailabilityActiveFrontendUseCase {
  constructor(private readonly repository: AvailabilityManagementRepository) {}

  execute(id: string): Promise<DoctorAvailability> {
    return this.repository.toggleAvailabilityActive(id)
  }
}
