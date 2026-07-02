import { onMounted } from 'vue'
import { appointmentServiceLocator } from '~~/src/infrastructure/appointments/service-locator'
import { createAppointmentsListViewModel } from '~~/src/presentation/view-models/appointments/appointments-list-view-model'

export const useAppointmentsListViewModel = () => {
  const route = useRoute()
  const page = typeof route.query.page === 'string' ? Number.parseInt(route.query.page, 10) : 1
  const pageSize = typeof route.query.pageSize === 'string' ? Number.parseInt(route.query.pageSize, 10) : 10

  const viewModel = createAppointmentsListViewModel({
    listTodayAppointmentsUseCase: appointmentServiceLocator.listTodayAppointmentsUseCase,
    getAppointmentSessionContextUseCase: appointmentServiceLocator.getAppointmentSessionContextUseCase,
    initialPage: Number.isNaN(page) ? 1 : page,
    initialPageSize: Number.isNaN(pageSize) ? 10 : pageSize,
  })

  onMounted(() => {
    void Promise.all([viewModel.loadAppointments(), viewModel.loadSessionContext()])
  })

  return viewModel
}
