import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { Consultation } from '../../../domain/entities/consultation'
import type { AppointmentRepository } from '../../../domain/repositories/appointment-repository'
import type { ConsultationRepository } from '../../../domain/repositories/consultation-repository'

const STARTABLE_APPOINTMENT_STATUSES = ['checked_in', 'in_progress'] as const

export interface StartConsultationInput {
  appointmentId: string
  organizationId: string
  userId: string
}

export class StartConsultationUseCase {
  constructor(
    private readonly consultationRepository: ConsultationRepository,
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(input: StartConsultationInput): Promise<Consultation> {
    const appointment = await this.appointmentRepository.findById(input.appointmentId)

    if (!appointment || appointment.organizationId !== input.organizationId) {
      throw new BusinessRuleError('Cita no encontrada.')
    }

    const existingConsultation = await this.consultationRepository.findByAppointmentId(
      input.appointmentId,
      input.organizationId,
    )

    if (existingConsultation) {
      return existingConsultation
    }

    if (!STARTABLE_APPOINTMENT_STATUSES.includes(appointment.status as (typeof STARTABLE_APPOINTMENT_STATUSES)[number])) {
      throw new BusinessRuleError(
        'Solo se puede iniciar una consulta para citas en estado checked_in o in_progress.',
      )
    }

    const now = new Date()

    return this.consultationRepository.create({
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      createdBy: input.userId,

      anamnesisText: null,
      attachmentKeys: [],

      bloodPressure: null,
      heartRate: null,
      respiratoryRate: null,
      oxygenSaturation: null,
      temperature: null,
      additionalExams: [],

      diagnoses: [],
      appreciation: null,

      medications: [],
      treatmentPlan: null,
      auxiliaryExams: [],

      status: 'draft',
      completedAt: null,

      createdAt: now,
      updatedAt: now,
    })
  }
}
