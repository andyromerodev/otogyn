import type { ConsultationRepository } from '../../../ports/consultation-repository'

export class UploadConsultationAttachmentFrontendUseCase {
  constructor(private readonly consultationRepository: ConsultationRepository) {}

  execute(consultationId: string, file: File): Promise<{ key: string; attachmentKeys: string[] }> {
    return this.consultationRepository.uploadAttachment(consultationId, file)
  }
}
