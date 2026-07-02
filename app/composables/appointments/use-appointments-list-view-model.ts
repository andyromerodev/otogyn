import { onMounted } from 'vue'
import { appointmentServiceLocator } from '~~/src/infrastructure/appointments/service-locator'
import type { AppointmentListFilter } from '~~/src/application/dto/appointment-management'
import { createAppointmentsListViewModel } from '~~/src/presentation/view-models/appointments/appointments-list-view-model'

export const useAppointmentsListViewModel = () => {
  const route = useRoute()
  const search = typeof route.query.search === 'string' ? route.query.search : ''
  const filter = typeof route.query.filter === 'string' &&
    ['all', 'today', 'current_week', 'last_week', 'current_month', 'last_month'].includes(route.query.filter)
    ? route.query.filter as AppointmentListFilter
    : 'all'
  const page = typeof route.query.page === 'string' ? Number.parseInt(route.query.page, 10) : 1
  const pageSize = typeof route.query.pageSize === 'string' ? Number.parseInt(route.query.pageSize, 10) : 10

  const viewModel = createAppointmentsListViewModel({
    listAppointmentsUseCase: appointmentServiceLocator.listAppointmentsUseCase,
    getAppointmentSessionContextUseCase: appointmentServiceLocator.getAppointmentSessionContextUseCase,
    initialSearch: search,
    initialFilter: filter,
    initialPage: Number.isNaN(page) ? 1 : page,
    initialPageSize: Number.isNaN(pageSize) ? 10 : pageSize,
  })

  onMounted(() => {
    void Promise.all([viewModel.loadAppointments(), viewModel.loadSessionContext()])
  })

  return viewModel
}
