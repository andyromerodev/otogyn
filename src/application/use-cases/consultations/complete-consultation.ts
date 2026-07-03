import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { Consultation } from '../../../domain/entities/consultation'
import type { ConsultationRepository } from '../../../domain/repositories/consultation-repository'
import type { Role } from '../../../domain/value-objects/role'
import { ChangeAppointmentStatusUseCase } from '../change-appointment-status'

export interface CompleteConsultationInput {
  consultationId: string
  organizationId: string
  updatedBy: string
  actorRole: Extract<Role, 'admin_doctor' | 'assistant'>
}

export class CompleteConsultationUseCase {
  constructor(
    private readonly consultationRepository: ConsultationRepository,
    private readonly changeAppointmentStatusUseCase: ChangeAppointmentStatusUseCase,
  ) {}

  async execute(input: CompleteConsultationInput): Promise<Consultation> {
    const consultation = await this.consultationRepository.findById(
      input.consultationId,
      input.organizationId,
    )

    if (!consultation) {
      throw new BusinessRuleError('Consulta no encontrada.')
    }

    if (consultation.status === 'completed') {
      throw new BusinessRuleError('La consulta ya está completada.')
    }

    const completedAt = new Date()

    const updatedConsultation = await this.consultationRepository.update(
      input.consultationId,
      input.organizationId,
      {
        status: 'completed',
        completedAt,
      },
    )

    await this.changeAppointmentStatusUseCase.execute({
      appointmentId: consultation.appointmentId,
      status: 'completed',
      updatedBy: input.updatedBy,
      actorRole: input.actorRole,
    })

    return updatedConsultation
  }
}
