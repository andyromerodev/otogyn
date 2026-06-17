import { serviceServiceLocator } from '~~/src/infrastructure/services/service-locator'
import { createServicesScreen } from '~~/src/presentation/view-models/services/create-services-screen'

export const useServicesScreen = async () => {
  const screen = createServicesScreen({
    listServicesUseCase: serviceServiceLocator.listServicesUseCase,
    createServiceUseCase: serviceServiceLocator.createServiceUseCase,
    updateServiceUseCase: serviceServiceLocator.updateServiceUseCase,
    getServiceScreenContextUseCase: serviceServiceLocator.getServiceScreenContextUseCase,
  })

  await Promise.all([screen.loadScreenContext(), screen.loadServices()])

  return screen
}
