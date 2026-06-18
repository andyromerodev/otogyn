import { CreatePublicBookingFrontendUseCase } from '../../application/use-cases/booking/frontend/create-public-booking'
import { GetPublicServicesFrontendUseCase } from '../../application/use-cases/booking/frontend/get-public-services'
import { GetPublicSlotsFrontendUseCase } from '../../application/use-cases/booking/frontend/get-public-slots'
import { HttpBookingRemoteDataSource } from './remote/http-booking-remote-data-source'
import { BookingRepositoryImpl } from './repositories/booking-repository-impl'

const bookingRemoteDataSource = new HttpBookingRemoteDataSource()
const bookingRepository = new BookingRepositoryImpl(bookingRemoteDataSource)

export const bookingServiceLocator = {
  getPublicServicesUseCase: new GetPublicServicesFrontendUseCase(bookingRepository),
  getPublicSlotsUseCase: new GetPublicSlotsFrontendUseCase(bookingRepository),
  createPublicBookingUseCase: new CreatePublicBookingFrontendUseCase(bookingRepository),
}
