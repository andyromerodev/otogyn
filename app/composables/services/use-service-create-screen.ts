import { serviceServiceLocator } from '~~/src/infrastructure/services/service-locator'
import { createServiceCreateScreen } from '~~/src/presentation/view-models/services/create-service-create-screen'

export const useServiceCreateScreen = () =>
  createServiceCreateScreen({
    createServiceUseCase: serviceServiceLocator.createServiceUseCase,
  })
