import type { ConsultationDetail, PatientConsultationHistoryItem } from '../dto/consultation'
import type { ConsultationUpdatePayload } from '../dto/consultation-update-payload'

export interface ConsultationRepository {
  start(appointmentId: string): Promise<ConsultationDetail>
  getByAppointment(appointmentId: string): Promise<ConsultationDetail>
  update(consultationId: string, data: ConsultationUpdatePayload): Promise<ConsultationDetail>
  complete(consultationId: string): Promise<ConsultationDetail>
  listByPatient(patientId: string): Promise<PatientConsultationHistoryItem[]>
  uploadAttachment(consultationId: string, file: File): Promise<{ key: string; attachmentKeys: string[] }>
}
