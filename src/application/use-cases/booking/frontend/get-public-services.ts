import type { PublicServiceDto } from '../../../dto/public-booking'
import type { BookingRepository } from '../../../ports/booking-repository'

export class GetPublicServicesFrontendUseCase {
  constructor(private readonly bookingRepository: BookingRepository) {}

  execute(): Promise<PublicServiceDto[]> {
    return this.bookingRepository.getPublicServices()
  }
}
