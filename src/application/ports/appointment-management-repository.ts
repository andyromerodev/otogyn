import type {
  AppointmentMutationInput,
  AppointmentPatientListResult,
  AppointmentServiceListResult,
  TodayAppointmentListResult,
} from '../dto/appointment-management'
import type { Appointment } from '../../domain/entities/appointment'

export interface AppointmentManagementRepository {
  listPatients(): Promise<AppointmentPatientListResult>
  listServices(): Promise<AppointmentServiceListResult>
  listTodayAppointments(): Promise<TodayAppointmentListResult>
  createAppointment(input: AppointmentMutationInput): Promise<Appointment>
}
