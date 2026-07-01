import { onMounted } from 'vue'
import { patientServiceLocator } from '~~/src/infrastructure/patients/service-locator'
import { createPatientsListViewModel } from '~~/src/presentation/view-models/patients/patients-list-view-model'
import type { PatientListFilter } from '~~/src/domain/repositories/patient-repository'

export const usePatientsListViewModel = () => {
  const route = useRoute()
  const search = typeof route.query.search === 'string' ? route.query.search : ''
  const filter = typeof route.query.filter === 'string' &&
    ['all', 'today', 'urgent', 'follow_up'].includes(route.query.filter)
    ? route.query.filter as PatientListFilter
    : 'all'
  const page = typeof route.query.page === 'string' ? Number.parseInt(route.query.page, 10) : 1
  const pageSize = typeof route.query.pageSize === 'string' ? Number.parseInt(route.query.pageSize, 10) : 10

  const viewModel = createPatientsListViewModel({
    listPatientsUseCase: patientServiceLocator.listPatientsUseCase,
    initialSearch: search,
    initialFilter: filter,
    initialPage: Number.isNaN(page) ? 1 : page,
    initialPageSize: Number.isNaN(pageSize) ? 10 : pageSize,
  })

  onMounted(() => {
    void viewModel.loadPatients()
  })

  return viewModel
}
