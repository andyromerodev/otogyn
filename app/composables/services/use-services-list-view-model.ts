import { onMounted } from 'vue'
import { serviceServiceLocator } from '~~/src/infrastructure/services/service-locator'
import { createServicesListViewModel } from '~~/src/presentation/view-models/services/services-list-view-model'

export const useServicesListViewModel = () => {
  const viewModel = createServicesListViewModel({
    listServicesUseCase: serviceServiceLocator.listServicesUseCase,
    getServiceScreenContextUseCase: serviceServiceLocator.getServiceScreenContextUseCase,
  })

  onMounted(() => {
    void Promise.all([viewModel.loadServices(), viewModel.loadScreenContext()])
  })

  return viewModel
}
