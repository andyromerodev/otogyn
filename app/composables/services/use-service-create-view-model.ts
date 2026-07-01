import { serviceServiceLocator } from '~~/src/infrastructure/services/service-locator'
import { createServiceCreateViewModel } from '~~/src/presentation/view-models/services/service-create-view-model'

export const useServiceCreateViewModel = () =>
  createServiceCreateViewModel({
    createServiceUseCase: serviceServiceLocator.createServiceUseCase,
  })
