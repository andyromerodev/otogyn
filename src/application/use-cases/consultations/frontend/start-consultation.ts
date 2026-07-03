import type { ConsultationDetail } from '../../../dto/consultation'
import type { ConsultationRepository } from '../../../ports/consultation-repository'

export class StartConsultationFrontendUseCase {
  constructor(private readonly consultationRepository: ConsultationRepository) {}

  execute(appointmentId: string): Promise<ConsultationDetail> {
    return this.consultationRepository.start(appointmentId)
  }
}
