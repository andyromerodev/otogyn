import { onMounted } from 'vue'
import { patientServiceLocator } from '~~/src/infrastructure/patients/service-locator'
import { createPatientsListScreen } from '~~/src/presentation/view-models/patients/create-patients-list-screen'
import type { PatientListFilter } from '~~/src/domain/repositories/patient-repository'

export const usePatientsListScreen = () => {
  const route = useRoute()
  const search = typeof route.query.search === 'string' ? route.query.search : ''
  const filter = typeof route.query.filter === 'string' &&
    ['all', 'today', 'urgent', 'follow_up'].includes(route.query.filter)
    ? route.query.filter as PatientListFilter
    : 'all'
  const page = typeof route.query.page === 'string' ? Number.parseInt(route.query.page, 10) : 1
  const pageSize = typeof route.query.pageSize === 'string' ? Number.parseInt(route.query.pageSize, 10) : 10

  const screen = createPatientsListScreen({
    listPatientsUseCase: patientServiceLocator.listPatientsUseCase,
    initialSearch: search,
    initialFilter: filter,
    initialPage: Number.isNaN(page) ? 1 : page,
    initialPageSize: Number.isNaN(pageSize) ? 10 : pageSize,
  })

  onMounted(() => {
    void screen.loadPatients()
  })

  return screen
}
