import type { ConsultationDetail } from '../../../dto/consultation'
import type { ConsultationRepository } from '../../../ports/consultation-repository'

export class GetConsultationByAppointmentFrontendUseCase {
  constructor(private readonly consultationRepository: ConsultationRepository) {}

  execute(appointmentId: string): Promise<ConsultationDetail> {
    return this.consultationRepository.getByAppointment(appointmentId)
  }
}
