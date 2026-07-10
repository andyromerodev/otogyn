import type { Appointment } from '../entities/appointment'
import type { PaymentMethod } from '../entities/payment'
import type { AppointmentStatsDto, AppointmentStatsRange } from '../../application/dto/appointment-stats'

export interface AppointmentStatsQuery {
  organizationId: string
  range: AppointmentStatsRange
}

export type AppointmentPaymentStatus = 'paid' | 'pending'

export interface AppointmentLinkedPayment {
  id: string
  amount: number
  method: PaymentMethod
  paidAt: Date
}

export interface AppointmentListPageQuery {
  organizationId: string
  search: string
  page: number
  pageSize: number
  startAtFrom?: Date
  startAtTo?: Date
}

export interface AppointmentListItem extends Appointment {
  patientName: string
  serviceName: string
  paymentStatus: AppointmentPaymentStatus
  linkedPayment: AppointmentLinkedPayment | null
}

export interface AppointmentListPageResult {
  items: AppointmentListItem[]
  total: number
  allTotal: number
  page: number
  pageSize: number
  totalPages: number
}

export interface AppointmentRepository {
  findById(appointmentId: string): Promise<Appointment | null>
  listPage(input: AppointmentListPageQuery): Promise<AppointmentListPageResult>
  listByDay(organizationId: string, day: Date): Promise<Appointment[]>
  listByRange(organizationId: string, start: Date, end: Date): Promise<Appointment[]>
  listCollisions(
    organizationId: string,
    startAt: Date,
    endAt: Date,
    ignoredAppointmentId?: string,
  ): Promise<Appointment[]>
  save(appointment: Appointment): Promise<Appointment>
  saveWithLock(appointment: Appointment): Promise<Appointment>
  getStats(input: AppointmentStatsQuery): Promise<AppointmentStatsDto>
}
