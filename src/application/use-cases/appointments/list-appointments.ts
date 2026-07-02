import type { AppointmentListQuery, AppointmentListResult } from '../../dto/appointment-management'
import type { AppointmentManagementRepository } from '../../ports/appointment-management-repository'

export class ListAppointmentsUseCase {
  constructor(private readonly appointmentRepository: AppointmentManagementRepository) {}

  execute(query: AppointmentListQuery): Promise<AppointmentListResult> {
    return this.appointmentRepository.listAppointments(query)
  }
}
