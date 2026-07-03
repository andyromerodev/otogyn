import type { ConsultationRepository } from '../../../domain/repositories/consultation-repository'
import type { PatientConsultationHistoryItem } from '../../dto/consultation'

export interface ListPatientConsultationsInput {
  patientId: string
  organizationId: string
}

export class ListPatientConsultationsUseCase {
  constructor(private readonly consultationRepository: ConsultationRepository) {}

  async execute(input: ListPatientConsultationsInput): Promise<PatientConsultationHistoryItem[]> {
    const consultations = await this.consultationRepository.listByPatient(
      input.patientId,
      input.organizationId,
    )

    return consultations.map((consultation) => ({
      id: consultation.id,
      appointmentId: consultation.appointmentId,
      createdAt: consultation.createdAt,
      completedAt: consultation.completedAt,
      status: consultation.status,
      diagnoses: consultation.diagnoses,
    }))
  }
}
