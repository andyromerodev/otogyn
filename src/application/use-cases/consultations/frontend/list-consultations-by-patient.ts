import type { PatientConsultationHistoryItem } from '../../../dto/consultation'
import type { ConsultationRepository } from '../../../ports/consultation-repository'

export class ListConsultationsByPatientFrontendUseCase {
  constructor(private readonly consultationRepository: ConsultationRepository) {}

  execute(patientId: string): Promise<PatientConsultationHistoryItem[]> {
    return this.consultationRepository.listByPatient(patientId)
  }
}
