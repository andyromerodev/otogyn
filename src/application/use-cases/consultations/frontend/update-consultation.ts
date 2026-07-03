import type { ConsultationDetail } from '../../../dto/consultation'
import type { ConsultationUpdatePayload } from '../../../dto/consultation-update-payload'
import type { ConsultationRepository } from '../../../ports/consultation-repository'

export class UpdateConsultationFrontendUseCase {
  constructor(private readonly consultationRepository: ConsultationRepository) {}

  execute(consultationId: string, data: ConsultationUpdatePayload): Promise<ConsultationDetail> {
    return this.consultationRepository.update(consultationId, data)
  }
}
