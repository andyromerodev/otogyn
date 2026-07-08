import type {
  AppointmentAvailableSlotsQuery,
  AppointmentDirectoryQuery,
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
} from '../../../application/dto/appointment-management'
import type { Appointment } from '../../../domain/entities/appointment'
import type { AppointmentRemoteDataSource } from './appointment-remote-data-source'

export class HttpAppointmentRemoteDataSource implements AppointmentRemoteDataSource {
  async getAppointmentDetail(appointmentId: string): Promise<AppointmentDetailResult> {
    return $fetch<AppointmentDetailResult>(`/api/appointments/${appointmentId}` as string)
  }

  async listAppointments(query: AppointmentListQuery): Promise<AppointmentListResult> {
    return $fetch<AppointmentListResult>('/api/appointments' as string, {
      query: {
        search: query.search ?? '',
        filter: query.filter ?? 'all',
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 10,
      },
    })
  }

  async listPatients(query?: AppointmentDirectoryQuery): Promise<AppointmentPatientListResult> {
    return $fetch<AppointmentPatientListResult>('/api/appointments/patients' as string, {
      query: {
        search: query?.search ?? '',
      },
    })
  }

  async listServices(query?: AppointmentDirectoryQuery): Promise<AppointmentServiceListResult> {
    return $fetch<AppointmentServiceListResult>('/api/services' as string, {
      query: {
        search: query?.search ?? '',
      },
    })
  }

  async listTodayAppointments(): Promise<TodayAppointmentListResult> {
    return $fetch<TodayAppointmentListResult>('/api/appointments/today' as string)
  }

  async getSessionContext(): Promise<AppointmentSessionContextDto> {
    return $fetch<AppointmentSessionContextDto>('/api/auth/session-context' as string)
  }

  async getAvailableSlots(query: AppointmentAvailableSlotsQuery): Promise<AppointmentSlotDto[]> {
    return $fetch<AppointmentSlotDto[]>('/api/appointments/available-slots' as string, {
      query: {
        date: query.date,
        serviceId: query.serviceId,
        excludeAppointmentId: query.excludeAppointmentId,
      },
    })
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
