import type { AppointmentAvailableSlotsQuery, AppointmentSlotDto } from '../../dto/appointment-management'
import type { AppointmentManagementRepository } from '../../ports/appointment-management-repository'

export class GetAppointmentAvailableSlotsUseCase {
  constructor(private readonly appointmentRepository: AppointmentManagementRepository) {}

  execute(query: AppointmentAvailableSlotsQuery): Promise<AppointmentSlotDto[]> {
    return this.appointmentRepository.getAvailableSlots(query)
  }
}
