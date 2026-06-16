import type {
  AppointmentMutationInput,
  AppointmentPatientListResult,
  AppointmentServiceListResult,
  TodayAppointmentListResult,
} from '../../../application/dto/appointment-management'
import type { Appointment } from '../../../domain/entities/appointment'
import type { AppointmentRemoteDataSource } from './appointment-remote-data-source'

export class HttpAppointmentRemoteDataSource implements AppointmentRemoteDataSource {
  async listPatients(): Promise<AppointmentPatientListResult> {
    return $fetch<AppointmentPatientListResult>('/api/patients' as string)
  }

  async listServices(): Promise<AppointmentServiceListResult> {
    return $fetch<AppointmentServiceListResult>('/api/services' as string)
  }

  async listTodayAppointments(): Promise<TodayAppointmentListResult> {
    return $fetch<TodayAppointmentListResult>('/api/appointments/today' as string)
  }

  async createAppointment(input: AppointmentMutationInput): Promise<Appointment> {
    return $fetch<Appointment>('/api/appointments' as string, {
      method: 'POST',
      body: input,
    })
  }
}
