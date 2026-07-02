import type { AppointmentRepository } from '../../domain/repositories/appointment-repository'
import type { DashboardSummaryDto } from '../dto/dashboard'
import { toAppTimeLabel } from '../utils/date/local-date'

export class GetDashboardSummaryUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(input: { organizationId: string; day: Date }): Promise<DashboardSummaryDto> {
    const appointments = await this.appointmentRepository.listByDay(input.organizationId, input.day)

    const completedToday = appointments.filter((appointment) => appointment.status === 'completed').length
    const pendingToday = appointments.filter((appointment) =>
      ['scheduled', 'confirmed', 'checked_in', 'in_progress'].includes(appointment.status),
    ).length
    const urgentToday = appointments.filter((appointment) => appointment.isUrgent).length
    const activeConsultation = appointments.find((appointment) => appointment.status === 'in_progress')

    return {
      totalToday: appointments.length,
      completedToday,
      pendingToday,
      urgentToday,
      activeConsultationLabel: activeConsultation
        ? toAppTimeLabel(activeConsultation.startAt)
        : null,
    }
  }
}
