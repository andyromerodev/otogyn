import type { Consultation } from '../entities/consultation'

export interface ConsultationRepository {
  create(consultation: Consultation): Promise<Consultation>
  update(id: string, organizationId: string, partial: Partial<Consultation>): Promise<Consultation>
  findById(id: string, organizationId: string): Promise<Consultation | null>
  findByAppointmentId(appointmentId: string, organizationId: string): Promise<Consultation | null>
  listByPatient(patientId: string, organizationId: string): Promise<Consultation[]>
}
