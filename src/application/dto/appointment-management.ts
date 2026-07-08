import type { MedicalService } from '../../domain/entities/medical-service'
import type { Patient } from '../../domain/entities/patient'
import type { AppointmentStatus } from '../../domain/value-objects/appointment-status'
import type { AppointmentDetailViewModel } from '../../presentation/view-models/appointments/appointment-detail'
import type { AppointmentListItemViewModel } from '../../presentation/view-models/appointments/appointment-list'
import type { TodayAppointmentViewModel } from '../../presentation/view-models/dashboard'

export type AppointmentListFilter =
  | 'all'
  | 'today'
  | 'current_week'
  | 'last_week'
  | 'current_month'
  | 'last_month'

export interface AppointmentListQuery {
  search?: string
  filter?: AppointmentListFilter
  page?: number
  pageSize?: number
}

export interface AppointmentDirectoryQuery {
  search?: string
}

export interface AppointmentListResult {
  items: AppointmentListItemViewModel[]
  total: number
  allTotal: number
  page: number
  pageSize: number
  totalPages: number
}

export interface AppointmentMutationInput {
  patientId: string
  serviceId: string
  agreedPrice?: number | null
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
export type AppointmentDetailResult = AppointmentDetailViewModel
