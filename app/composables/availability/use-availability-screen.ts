import { availabilityServiceLocator } from '~~/src/infrastructure/availability/service-locator'
import { createAvailabilityScreen } from '~~/src/presentation/view-models/availability/create-availability-screen'

export const useAvailabilityScreen = async () => {
  const screen = createAvailabilityScreen({
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

  await screen.loadAvailability()

  return screen
}
