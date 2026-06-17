import { appointmentServiceLocator } from '~~/src/infrastructure/appointments/service-locator'
import { createAppointmentsScreen } from '~~/src/presentation/view-models/appointments/create-appointments-screen'

export const useAppointmentsScreen = async () => {
  const screen = createAppointmentsScreen({
    getAppointmentSessionContextUseCase: appointmentServiceLocator.getAppointmentSessionContextUseCase,
    listAppointmentPatientsUseCase: appointmentServiceLocator.listAppointmentPatientsUseCase,
    listAppointmentServicesUseCase: appointmentServiceLocator.listAppointmentServicesUseCase,
    listTodayAppointmentsUseCase: appointmentServiceLocator.listTodayAppointmentsUseCase,
    updateAppointmentUseCase: appointmentServiceLocator.updateAppointmentUseCase,
    cancelAppointmentUseCase: appointmentServiceLocator.cancelAppointmentUseCase,
    changeAppointmentStatusUseCase: appointmentServiceLocator.changeAppointmentStatusUseCase,
    createAppointmentUseCase: appointmentServiceLocator.createAppointmentUseCase,
  })

  await screen.loadScreenData()

  return screen
}
