import { CancelAppointmentUseCase } from '../../application/use-cases/appointments/cancel-appointment'
import { ChangeAppointmentStatusUseCase } from '../../application/use-cases/appointments/change-appointment-status'
import { CreateAppointmentUseCase } from '../../application/use-cases/appointments/create-appointment'
import { GetAppointmentAvailableSlotsUseCase } from '../../application/use-cases/appointments/get-appointment-available-slots'
import { GetAppointmentDetailUseCase } from '../../application/use-cases/appointments/get-appointment-detail'
import { GetAppointmentSessionContextUseCase } from '../../application/use-cases/appointments/get-appointment-session-context'
import { ListAppointmentPatientsUseCase } from '../../application/use-cases/appointments/list-appointment-patients'
import { ListAppointmentServicesUseCase } from '../../application/use-cases/appointments/list-appointment-services'
import { ListTodayAppointmentsUseCase } from '../../application/use-cases/appointments/list-today-appointments'
import { UpdateAppointmentUseCase } from '../../application/use-cases/appointments/update-appointment'
import { HttpAppointmentRemoteDataSource } from './remote/http-appointment-remote-data-source'
import { AppointmentManagementRepositoryImpl } from './repositories/appointment-management-repository-impl'

const appointmentRemoteDataSource = new HttpAppointmentRemoteDataSource()
const appointmentRepository = new AppointmentManagementRepositoryImpl(appointmentRemoteDataSource)

export const appointmentServiceLocator = {
  getAppointmentDetailUseCase: new GetAppointmentDetailUseCase(appointmentRepository),
  getAppointmentSessionContextUseCase: new GetAppointmentSessionContextUseCase(appointmentRepository),
  getAppointmentAvailableSlotsUseCase: new GetAppointmentAvailableSlotsUseCase(appointmentRepository),
  listAppointmentPatientsUseCase: new ListAppointmentPatientsUseCase(appointmentRepository),
  listAppointmentServicesUseCase: new ListAppointmentServicesUseCase(appointmentRepository),
  listTodayAppointmentsUseCase: new ListTodayAppointmentsUseCase(appointmentRepository),
  updateAppointmentUseCase: new UpdateAppointmentUseCase(appointmentRepository),
  cancelAppointmentUseCase: new CancelAppointmentUseCase(appointmentRepository),
  changeAppointmentStatusUseCase: new ChangeAppointmentStatusUseCase(appointmentRepository),
  createAppointmentUseCase: new CreateAppointmentUseCase(appointmentRepository),
}
