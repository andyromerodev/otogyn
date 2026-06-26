import { onMounted } from 'vue'
import { serviceServiceLocator } from '~~/src/infrastructure/services/service-locator'
import { createServicesListScreen } from '~~/src/presentation/view-models/services/create-services-list-screen'

export const useServicesListScreen = () => {
  const screen = createServicesListScreen({
    listServicesUseCase: serviceServiceLocator.listServicesUseCase,
    getServiceScreenContextUseCase: serviceServiceLocator.getServiceScreenContextUseCase,
  })

  onMounted(() => {
    void Promise.all([screen.loadServices(), screen.loadScreenContext()])
  })

  return screen
}
