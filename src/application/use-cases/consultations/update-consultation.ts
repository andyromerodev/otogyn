import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { Consultation } from '../../../domain/entities/consultation'
import type { ConsultationRepository } from '../../../domain/repositories/consultation-repository'
import type { UpdateConsultationInput } from '../../dto/consultation'

export interface UpdateConsultationUseCaseInput {
  consultationId: string
  organizationId: string
  data: UpdateConsultationInput
}

export class UpdateConsultationUseCase {
  constructor(private readonly consultationRepository: ConsultationRepository) {}

  async execute(input: UpdateConsultationUseCaseInput): Promise<Consultation> {
    const consultation = await this.consultationRepository.findById(
      input.consultationId,
      input.organizationId,
    )

    if (!consultation) {
      throw new BusinessRuleError('Consulta no encontrada.')
    }

    if (consultation.status === 'completed') {
      throw new BusinessRuleError('No se puede modificar una consulta completada.')
    }

    return this.consultationRepository.update(input.consultationId, input.organizationId, {
      ...input.data,
    })
  }
}
