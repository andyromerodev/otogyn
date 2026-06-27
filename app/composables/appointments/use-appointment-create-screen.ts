import { appointmentServiceLocator } from '~~/src/infrastructure/appointments/service-locator'
import { createAppointmentCreateScreen } from '~~/src/presentation/view-models/appointments/create-appointment-create-screen'

export const useAppointmentCreateScreen = async () => {
  const screen = createAppointmentCreateScreen({
    listAppointmentPatientsUseCase: appointmentServiceLocator.listAppointmentPatientsUseCase,
    listAppointmentServicesUseCase: appointmentServiceLocator.listAppointmentServicesUseCase,
    createAppointmentUseCase: appointmentServiceLocator.createAppointmentUseCase,
  })

  await screen.loadFormOptions()

  return screen
}
