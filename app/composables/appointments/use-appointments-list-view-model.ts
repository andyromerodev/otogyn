import { onMounted } from 'vue'
import { appointmentServiceLocator } from '~~/src/infrastructure/appointments/service-locator'
import { createAppointmentsListViewModel } from '~~/src/presentation/view-models/appointments/appointments-list-view-model'

export const useAppointmentsListViewModel = () => {
  const viewModel = createAppointmentsListViewModel({
    listTodayAppointmentsUseCase: appointmentServiceLocator.listTodayAppointmentsUseCase,
    getAppointmentSessionContextUseCase: appointmentServiceLocator.getAppointmentSessionContextUseCase,
  })

  onMounted(() => {
    void Promise.all([viewModel.loadAppointments(), viewModel.loadSessionContext()])
  })

  return viewModel
}
