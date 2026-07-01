import { serviceServiceLocator } from '~~/src/infrastructure/services/service-locator'
import { createServiceDetailViewModel } from '~~/src/presentation/view-models/services/service-detail-view-model'

export const useServiceDetailViewModel = async (serviceId: string) => {
  const viewModel = createServiceDetailViewModel({
    serviceId,
    getServiceDetailUseCase: serviceServiceLocator.getServiceDetailUseCase,
    updateServiceUseCase: serviceServiceLocator.updateServiceUseCase,
    deleteServiceUseCase: serviceServiceLocator.deleteServiceUseCase,
    getServiceScreenContextUseCase: serviceServiceLocator.getServiceScreenContextUseCase,
  })

  await Promise.all([viewModel.loadService(), viewModel.loadScreenContext()])

  return viewModel
}
