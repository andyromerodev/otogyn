import type { AppointmentStatsDto, AppointmentStatsRange } from '../dto/appointment-stats'
import type { AppointmentRepository } from '../../domain/repositories/appointment-repository'

export interface GetAppointmentStatsInput {
  organizationId: string
  range: AppointmentStatsRange
}

export class GetAppointmentStatsUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  execute(input: GetAppointmentStatsInput): Promise<AppointmentStatsDto> {
    return this.appointmentRepository.getStats(input)
  }
}
