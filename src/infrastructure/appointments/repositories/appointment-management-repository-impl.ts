import type {
  AppointmentCancellationInput,
  AppointmentMutationInput,
  AppointmentPatientListResult,
  AppointmentSessionContextDto,
  AppointmentServiceListResult,
  AppointmentStatusMutationInput,
  TodayAppointmentListResult,
} from '../../../application/dto/appointment-management'
import type { AppointmentManagementRepository } from '../../../application/ports/appointment-management-repository'
import type { Appointment } from '../../../domain/entities/appointment'
import type { AppointmentRemoteDataSource } from '../remote/appointment-remote-data-source'

export class AppointmentManagementRepositoryImpl implements AppointmentManagementRepository {
  constructor(private readonly remoteDataSource: AppointmentRemoteDataSource) {}

  listPatients(): Promise<AppointmentPatientListResult> {
    return this.remoteDataSource.listPatients()
  }

  listServices(): Promise<AppointmentServiceListResult> {
    return this.remoteDataSource.listServices()
  }

  listTodayAppointments(): Promise<TodayAppointmentListResult> {
    return this.remoteDataSource.listTodayAppointments()
  }

  getSessionContext(): Promise<AppointmentSessionContextDto> {
    return this.remoteDataSource.getSessionContext()
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
