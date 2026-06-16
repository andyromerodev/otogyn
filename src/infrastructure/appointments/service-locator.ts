import { CreateAppointmentUseCase } from '../../application/use-cases/appointments/create-appointment'
import { ListAppointmentPatientsUseCase } from '../../application/use-cases/appointments/list-appointment-patients'
import { ListAppointmentServicesUseCase } from '../../application/use-cases/appointments/list-appointment-services'
import { ListTodayAppointmentsUseCase } from '../../application/use-cases/appointments/list-today-appointments'
import { HttpAppointmentRemoteDataSource } from './remote/http-appointment-remote-data-source'
import { AppointmentManagementRepositoryImpl } from './repositories/appointment-management-repository-impl'

const appointmentRemoteDataSource = new HttpAppointmentRemoteDataSource()
const appointmentRepository = new AppointmentManagementRepositoryImpl(appointmentRemoteDataSource)

export const appointmentServiceLocator = {
  listAppointmentPatientsUseCase: new ListAppointmentPatientsUseCase(appointmentRepository),
  listAppointmentServicesUseCase: new ListAppointmentServicesUseCase(appointmentRepository),
  listTodayAppointmentsUseCase: new ListTodayAppointmentsUseCase(appointmentRepository),
  createAppointmentUseCase: new CreateAppointmentUseCase(appointmentRepository),
}
