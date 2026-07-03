import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { ConsultationRepository } from '../../../domain/repositories/consultation-repository'
import type { ConsultationDetail } from '../../dto/consultation'

export interface GetConsultationByAppointmentInput {
  appointmentId: string
  organizationId: string
}

export class GetConsultationByAppointmentUseCase {
  constructor(private readonly consultationRepository: ConsultationRepository) {}

  async execute(input: GetConsultationByAppointmentInput): Promise<ConsultationDetail> {
    const consultation = await this.consultationRepository.findByAppointmentId(
      input.appointmentId,
      input.organizationId,
    )

    if (!consultation) {
      throw new BusinessRuleError('Consulta no encontrada.')
    }

    return consultation
  }
}
