import type {
  AppointmentCancellationInput,
  AppointmentMutationInput,
  AppointmentPatientListResult,
  AppointmentSessionContextDto,
  AppointmentServiceListResult,
  AppointmentStatusMutationInput,
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

  async getSessionContext(): Promise<AppointmentSessionContextDto> {
    return $fetch<AppointmentSessionContextDto>('/api/auth/session-context' as string)
  }

  async createAppointment(input: AppointmentMutationInput): Promise<Appointment> {
    return $fetch<Appointment>('/api/appointments' as string, {
      method: 'POST',
      body: input,
    })
  }

  async updateAppointment(appointmentId: string, input: AppointmentMutationInput): Promise<Appointment> {
    return $fetch<Appointment>(`/api/appointments/${appointmentId}` as string, {
      method: 'PATCH',
      body: input,
    })
  }

  async cancelAppointment(input: AppointmentCancellationInput): Promise<Appointment> {
    return $fetch<Appointment>(`/api/appointments/${input.appointmentId}/cancel` as string, {
      method: 'POST',
    })
  }

  async changeAppointmentStatus(input: AppointmentStatusMutationInput): Promise<Appointment> {
    return $fetch<Appointment>(`/api/appointments/${input.appointmentId}/status` as string, {
      method: 'POST',
      body: {
        status: input.status,
      },
    })
  }
}
