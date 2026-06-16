import type { MedicalService } from '../../domain/entities/medical-service'
import type { Patient } from '../../domain/entities/patient'
import type { TodayAppointmentViewModel } from '../../presentation/view-models/dashboard'

export interface AppointmentMutationInput {
  patientId: string
  serviceId: string
  professionalId?: string | null
  startAt: string
  isUrgent?: boolean
  reason?: string | null
  notes?: string | null
}

export type AppointmentPatientListResult = Patient[]
export type AppointmentServiceListResult = MedicalService[]
export type TodayAppointmentListResult = TodayAppointmentViewModel[]
