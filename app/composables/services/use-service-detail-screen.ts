import { serviceServiceLocator } from '~~/src/infrastructure/services/service-locator'
import { createServiceDetailScreen } from '~~/src/presentation/view-models/services/create-service-detail-screen'

export const useServiceDetailScreen = async (serviceId: string) => {
  const screen = createServiceDetailScreen({
    serviceId,
    getServiceDetailUseCase: serviceServiceLocator.getServiceDetailUseCase,
    updateServiceUseCase: serviceServiceLocator.updateServiceUseCase,
    deleteServiceUseCase: serviceServiceLocator.deleteServiceUseCase,
    getServiceScreenContextUseCase: serviceServiceLocator.getServiceScreenContextUseCase,
  })

  await Promise.all([screen.loadService(), screen.loadScreenContext()])

  return screen
}
