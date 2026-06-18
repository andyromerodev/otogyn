import { bookingServiceLocator } from '~~/src/infrastructure/booking/service-locator'
import { createBookingScreen } from '~~/src/presentation/view-models/booking/booking-screen'

export const useBookingScreen = async () => {
  const screen = createBookingScreen({
    getPublicServicesUseCase: bookingServiceLocator.getPublicServicesUseCase,
    getPublicSlotsUseCase: bookingServiceLocator.getPublicSlotsUseCase,
    createPublicBookingUseCase: bookingServiceLocator.createPublicBookingUseCase,
  })

  await screen.loadServices()

  return screen
}
