import type { ConsultationDetail } from '../../../dto/consultation'
import type { ConsultationRepository } from '../../../ports/consultation-repository'

export class CompleteConsultationFrontendUseCase {
  constructor(private readonly consultationRepository: ConsultationRepository) {}

  execute(consultationId: string): Promise<ConsultationDetail> {
    return this.consultationRepository.complete(consultationId)
  }
}
