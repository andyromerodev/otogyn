import type { MedicalService } from '../../domain/entities/medical-service'
import type { Patient } from '../../domain/entities/patient'
import type { AppointmentStatus } from '../../domain/value-objects/appointment-status'
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

export interface AppointmentStatusMutationInput {
  appointmentId: string
  status: Exclude<AppointmentStatus, 'cancelled'>
}

export interface AppointmentCancellationInput {
  appointmentId: string
}

export interface AppointmentSessionContextDto {
  role: 'admin_doctor' | 'assistant'
}

export interface AppointmentAvailableSlotsQuery {
  date: string
  serviceId: string
  excludeAppointmentId?: string
}

export interface AppointmentSlotDto {
  startsAt: string
  endsAt: string
  durationMinutes: number
}

export type AppointmentPatientListResult = Patient[]
export type AppointmentServiceListResult = MedicalService[]
export type TodayAppointmentListResult = TodayAppointmentViewModel[]
export type AppointmentDetailResult = TodayAppointmentViewModel
