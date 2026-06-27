import { appointmentServiceLocator } from '~~/src/infrastructure/appointments/service-locator'
import { createAppointmentDetailScreen } from '~~/src/presentation/view-models/appointments/create-appointment-detail-screen'

export const useAppointmentDetailScreen = async (appointmentId: string) => {
  const screen = createAppointmentDetailScreen({
    appointmentId,
    getAppointmentDetailUseCase: appointmentServiceLocator.getAppointmentDetailUseCase,
    listAppointmentPatientsUseCase: appointmentServiceLocator.listAppointmentPatientsUseCase,
    listAppointmentServicesUseCase: appointmentServiceLocator.listAppointmentServicesUseCase,
    getAppointmentSessionContextUseCase: appointmentServiceLocator.getAppointmentSessionContextUseCase,
    updateAppointmentUseCase: appointmentServiceLocator.updateAppointmentUseCase,
    cancelAppointmentUseCase: appointmentServiceLocator.cancelAppointmentUseCase,
    changeAppointmentStatusUseCase: appointmentServiceLocator.changeAppointmentStatusUseCase,
  })

  await Promise.all([screen.loadAppointment(), screen.loadFormOptions(), screen.loadSessionContext()])

  return screen
}
