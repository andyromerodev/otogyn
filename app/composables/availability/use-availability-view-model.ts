import { availabilityServiceLocator } from '~~/src/infrastructure/availability/service-locator'
import { createAvailabilityViewModel } from '~~/src/presentation/view-models/availability/availability-view-model'

export const useAvailabilityViewModel = async () => {
  const viewModel = createAvailabilityViewModel({
    listAvailabilityUseCase: availabilityServiceLocator.listAvailabilityUseCase,
    createAvailabilityUseCase: availabilityServiceLocator.createAvailabilityUseCase,
    updateAvailabilityUseCase: availabilityServiceLocator.updateAvailabilityUseCase,
    toggleAvailabilityActiveUseCase: availabilityServiceLocator.toggleAvailabilityActiveUseCase,
    createBlockedSlotUseCase: availabilityServiceLocator.createBlockedSlotUseCase,
    deleteBlockedSlotUseCase: availabilityServiceLocator.deleteBlockedSlotUseCase,
    getSessionContext: {
      execute: () => $fetch<{ role: 'admin_doctor' | 'assistant' }>('/api/auth/session-context'),
    },
  })

  await viewModel.loadAvailability()

  return viewModel
}
