import type { ConsultationDetail, PatientConsultationHistoryItem } from '../../../application/dto/consultation'
import type { ConsultationUpdatePayload } from '../../../application/dto/consultation-update-payload'
import type { ConsultationRemoteDataSource } from './consultation-remote-data-source'

export class HttpConsultationRemoteDataSource implements ConsultationRemoteDataSource {
  start(appointmentId: string): Promise<ConsultationDetail> {
    return $fetch<ConsultationDetail>('/api/consultations', {
      method: 'POST',
      body: { appointmentId },
    })
  }

  getByAppointment(appointmentId: string): Promise<ConsultationDetail> {
    return $fetch<ConsultationDetail>(`/api/consultations/by-appointment/${appointmentId}`)
  }

  update(consultationId: string, data: ConsultationUpdatePayload): Promise<ConsultationDetail> {
    return $fetch<ConsultationDetail>(`/api/consultations/${consultationId}`, {
      method: 'PATCH',
      body: data,
    })
  }

  complete(consultationId: string): Promise<ConsultationDetail> {
    return $fetch<ConsultationDetail>(`/api/consultations/${consultationId}/complete`, {
      method: 'POST',
    })
  }

  listByPatient(patientId: string): Promise<PatientConsultationHistoryItem[]> {
    return $fetch<PatientConsultationHistoryItem[]>(`/api/consultations/patient/${patientId}`)
  }

  uploadAttachment(consultationId: string, file: File): Promise<{ key: string; attachmentKeys: string[] }> {
    const formData = new FormData()
    formData.append('file', file)

    return $fetch<{ key: string; attachmentKeys: string[] }>(`/api/consultations/${consultationId}/attachments`, {
      method: 'POST',
      body: formData,
    })
  }
}
