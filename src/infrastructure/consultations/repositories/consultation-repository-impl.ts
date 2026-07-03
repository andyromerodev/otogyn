import type { ConsultationDetail, PatientConsultationHistoryItem } from '../../../application/dto/consultation'
import type { ConsultationUpdatePayload } from '../../../application/dto/consultation-update-payload'
import type { ConsultationRepository } from '../../../application/ports/consultation-repository'
import type { ConsultationRemoteDataSource } from '../remote/consultation-remote-data-source'

export class ConsultationRepositoryImpl implements ConsultationRepository {
  constructor(private readonly remoteDataSource: ConsultationRemoteDataSource) {}

  start(appointmentId: string): Promise<ConsultationDetail> {
    return this.remoteDataSource.start(appointmentId)
  }

  getByAppointment(appointmentId: string): Promise<ConsultationDetail> {
    return this.remoteDataSource.getByAppointment(appointmentId)
  }

  update(consultationId: string, data: ConsultationUpdatePayload): Promise<ConsultationDetail> {
    return this.remoteDataSource.update(consultationId, data)
  }

  complete(consultationId: string): Promise<ConsultationDetail> {
    return this.remoteDataSource.complete(consultationId)
  }

  listByPatient(patientId: string): Promise<PatientConsultationHistoryItem[]> {
    return this.remoteDataSource.listByPatient(patientId)
  }

  uploadAttachment(consultationId: string, file: File): Promise<{ key: string; attachmentKeys: string[] }> {
    return this.remoteDataSource.uploadAttachment(consultationId, file)
  }
}
