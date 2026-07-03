import { BusinessRuleError } from '../../domain/errors/business-rule-error'
import type { Consultation } from '../../domain/entities/consultation'
import type { ConsultationRepository } from '../../domain/repositories/consultation-repository'

export class MockConsultationRepository implements ConsultationRepository {
  constructor(public readonly consultations: Consultation[] = []) {}

  async create(consultation: Consultation): Promise<Consultation> {
    this.consultations.push(consultation)
    return consultation
  }

  async update(
    id: string,
    organizationId: string,
    partial: Partial<Consultation>,
  ): Promise<Consultation> {
    const index = this.consultations.findIndex(
      (item) => item.id === id && item.organizationId === organizationId,
    )

    if (index === -1) {
      throw new BusinessRuleError('Consultation not found.')
    }

    const updated: Consultation = {
      ...this.consultations[index]!,
      ...partial,
      updatedAt: new Date(),
    }
    this.consultations[index] = updated
    return updated
  }

  async findById(id: string, organizationId: string): Promise<Consultation | null> {
    return (
      this.consultations.find(
        (item) => item.id === id && item.organizationId === organizationId,
      ) ?? null
    )
  }

  async findByAppointmentId(
    appointmentId: string,
    organizationId: string,
  ): Promise<Consultation | null> {
    return (
      this.consultations.find(
        (item) => item.appointmentId === appointmentId && item.organizationId === organizationId,
      ) ?? null
    )
  }

  async listByPatient(patientId: string, organizationId: string): Promise<Consultation[]> {
    return this.consultations
      .filter((item) => item.patientId === patientId && item.organizationId === organizationId)
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
  }
}
