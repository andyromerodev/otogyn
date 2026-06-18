import type { DoctorAvailability } from '../../../../domain/entities/doctor-availability'
import type { AvailabilityManagementRepository } from '../../../ports/availability-management-repository'

export class ListAvailabilityFrontendUseCase {
  constructor(private readonly repository: AvailabilityManagementRepository) {}

  execute(): Promise<DoctorAvailability[]> {
    return this.repository.listWeeklyAvailability()
  }
}
