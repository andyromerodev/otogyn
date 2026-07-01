import { appointmentServiceLocator } from '~~/src/infrastructure/appointments/service-locator'
import { createAppointmentCreateViewModel } from '~~/src/presentation/view-models/appointments/appointment-create-view-model'

export const useAppointmentCreateViewModel = async () => {
  const viewModel = createAppointmentCreateViewModel({
    listAppointmentPatientsUseCase: appointmentServiceLocator.listAppointmentPatientsUseCase,
    listAppointmentServicesUseCase: appointmentServiceLocator.listAppointmentServicesUseCase,
    createAppointmentUseCase: appointmentServiceLocator.createAppointmentUseCase,
  })

  await viewModel.loadFormOptions()

  return viewModel
}
