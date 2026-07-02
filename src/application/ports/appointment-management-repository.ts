import type {
  AppointmentAvailableSlotsQuery,
  AppointmentListQuery,
  AppointmentListResult,
  AppointmentDetailResult,
  AppointmentCancellationInput,
  AppointmentMutationInput,
  AppointmentPatientListResult,
  AppointmentSessionContextDto,
  AppointmentServiceListResult,
  AppointmentSlotDto,
  AppointmentStatusMutationInput,
  TodayAppointmentListResult,
} from '../dto/appointment-management'
import type { Appointment } from '../../domain/entities/appointment'

export interface AppointmentManagementRepository {
  getAppointmentDetail(appointmentId: string): Promise<AppointmentDetailResult>
  listAppointments(query: AppointmentListQuery): Promise<AppointmentListResult>
  listPatients(): Promise<AppointmentPatientListResult>
  listServices(): Promise<AppointmentServiceListResult>
  listTodayAppointments(): Promise<TodayAppointmentListResult>
  getSessionContext(): Promise<AppointmentSessionContextDto>
  getAvailableSlots(query: AppointmentAvailableSlotsQuery): Promise<AppointmentSlotDto[]>
  createAppointment(input: AppointmentMutationInput): Promise<Appointment>
  updateAppointment(appointmentId: string, input: AppointmentMutationInput): Promise<Appointment>
  cancelAppointment(input: AppointmentCancellationInput): Promise<Appointment>
  changeAppointmentStatus(input: AppointmentStatusMutationInput): Promise<Appointment>
}
