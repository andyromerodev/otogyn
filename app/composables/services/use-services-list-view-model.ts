import { onMounted } from 'vue'
import { serviceServiceLocator } from '~~/src/infrastructure/services/service-locator'
import { createServicesListViewModel } from '~~/src/presentation/view-models/services/services-list-view-model'

export const useServicesListViewModel = () => {
  const route = useRoute()
  const page = typeof route.query.page === 'string' ? Number.parseInt(route.query.page, 10) : 1
  const pageSize = typeof route.query.pageSize === 'string' ? Number.parseInt(route.query.pageSize, 10) : 10

  const viewModel = createServicesListViewModel({
    listServicesUseCase: serviceServiceLocator.listServicesUseCase,
    getServiceScreenContextUseCase: serviceServiceLocator.getServiceScreenContextUseCase,
    initialPage: Number.isNaN(page) ? 1 : page,
    initialPageSize: Number.isNaN(pageSize) ? 10 : pageSize,
  })

  onMounted(() => {
    void Promise.all([viewModel.loadServices(), viewModel.loadScreenContext()])
  })

  return viewModel
}
