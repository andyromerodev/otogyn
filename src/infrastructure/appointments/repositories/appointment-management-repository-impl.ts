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
import type { AppointmentManagementRepository } from '../../../application/ports/appointment-management-repository'
import type { Appointment } from '../../../domain/entities/appointment'
import type { AppointmentRemoteDataSource } from '../remote/appointment-remote-data-source'

export class AppointmentManagementRepositoryImpl implements AppointmentManagementRepository {
  constructor(private readonly remoteDataSource: AppointmentRemoteDataSource) {}

  getAppointmentDetail(appointmentId: string): Promise<AppointmentDetailResult> {
    return this.remoteDataSource.getAppointmentDetail(appointmentId)
  }

  listAppointments(query: AppointmentListQuery): Promise<AppointmentListResult> {
    return this.remoteDataSource.listAppointments(query)
  }

  listPatients(query?: AppointmentDirectoryQuery): Promise<AppointmentPatientListResult> {
    return this.remoteDataSource.listPatients(query)
  }

  listServices(query?: AppointmentDirectoryQuery): Promise<AppointmentServiceListResult> {
    return this.remoteDataSource.listServices(query)
  }

  listTodayAppointments(): Promise<TodayAppointmentListResult> {
    return this.remoteDataSource.listTodayAppointments()
  }

  getSessionContext(): Promise<AppointmentSessionContextDto> {
    return this.remoteDataSource.getSessionContext()
  }

  getAvailableSlots(query: AppointmentAvailableSlotsQuery): Promise<AppointmentSlotDto[]> {
    return this.remoteDataSource.getAvailableSlots(query)
  }

  createAppointment(input: AppointmentMutationInput): Promise<Appointment> {
    return this.remoteDataSource.createAppointment(input)
  }

  updateAppointment(appointmentId: string, input: AppointmentMutationInput): Promise<Appointment> {
    return this.remoteDataSource.updateAppointment(appointmentId, input)
  }

  cancelAppointment(input: AppointmentCancellationInput): Promise<Appointment> {
    return this.remoteDataSource.cancelAppointment(input)
  }

  changeAppointmentStatus(input: AppointmentStatusMutationInput): Promise<Appointment> {
    return this.remoteDataSource.changeAppointmentStatus(input)
  }
}
