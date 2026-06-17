import type {
  AppointmentCancellationInput,
  AppointmentMutationInput,
  AppointmentPatientListResult,
  AppointmentSessionContextDto,
  AppointmentServiceListResult,
  AppointmentStatusMutationInput,
  TodayAppointmentListResult,
} from '../dto/appointment-management'
import type { Appointment } from '../../domain/entities/appointment'

export interface AppointmentManagementRepository {
  listPatients(): Promise<AppointmentPatientListResult>
  listServices(): Promise<AppointmentServiceListResult>
  listTodayAppointments(): Promise<TodayAppointmentListResult>
  getSessionContext(): Promise<AppointmentSessionContextDto>
  createAppointment(input: AppointmentMutationInput): Promise<Appointment>
  updateAppointment(appointmentId: string, input: AppointmentMutationInput): Promise<Appointment>
  cancelAppointment(input: AppointmentCancellationInput): Promise<Appointment>
  changeAppointmentStatus(input: AppointmentStatusMutationInput): Promise<Appointment>
}
