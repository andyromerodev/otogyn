import { appointmentServiceLocator } from '~~/src/infrastructure/appointments/service-locator'
import { createAppointmentDetailViewModel } from '~~/src/presentation/view-models/appointments/appointment-detail-view-model'

export const useAppointmentDetailViewModel = async (appointmentId: string) => {
  const viewModel = createAppointmentDetailViewModel({
    appointmentId,
    getAppointmentDetailUseCase: appointmentServiceLocator.getAppointmentDetailUseCase,
    listAppointmentPatientsUseCase: appointmentServiceLocator.listAppointmentPatientsUseCase,
    listAppointmentServicesUseCase: appointmentServiceLocator.listAppointmentServicesUseCase,
    getAppointmentSessionContextUseCase: appointmentServiceLocator.getAppointmentSessionContextUseCase,
    updateAppointmentUseCase: appointmentServiceLocator.updateAppointmentUseCase,
    cancelAppointmentUseCase: appointmentServiceLocator.cancelAppointmentUseCase,
    changeAppointmentStatusUseCase: appointmentServiceLocator.changeAppointmentStatusUseCase,
  })

  await Promise.all([viewModel.loadAppointment(), viewModel.loadFormOptions(), viewModel.loadSessionContext()])

  return viewModel
}
