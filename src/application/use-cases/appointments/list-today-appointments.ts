import type { TodayAppointmentViewModel } from '../../../presentation/view-models/dashboard'
import type { AppointmentManagementRepository } from '../../ports/appointment-management-repository'

export class ListTodayAppointmentsUseCase {
  constructor(private readonly appointmentRepository: AppointmentManagementRepository) {}

  execute(): Promise<TodayAppointmentViewModel[]> {
    return this.appointmentRepository.listTodayAppointments()
  }
}
