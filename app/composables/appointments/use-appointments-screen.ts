import { appointmentServiceLocator } from '~~/src/infrastructure/appointments/service-locator'
import { createAppointmentsScreen } from '~~/src/presentation/view-models/appointments/create-appointments-screen'

export const useAppointmentsScreen = async () => {
  const screen = createAppointmentsScreen({
    listAppointmentPatientsUseCase: appointmentServiceLocator.listAppointmentPatientsUseCase,
    listAppointmentServicesUseCase: appointmentServiceLocator.listAppointmentServicesUseCase,
    listTodayAppointmentsUseCase: appointmentServiceLocator.listTodayAppointmentsUseCase,
    createAppointmentUseCase: appointmentServiceLocator.createAppointmentUseCase,
  })

  await screen.loadScreenData()

  return screen
}
