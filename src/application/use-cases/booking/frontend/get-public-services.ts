import type { PublicServiceListResult } from '../../../dto/public-booking'
import type { BookingRepository, GetPublicServicesInput } from '../../../ports/booking-repository'

export class GetPublicServicesFrontendUseCase {
  constructor(private readonly bookingRepository: BookingRepository) {}

  execute(input?: GetPublicServicesInput): Promise<PublicServiceListResult> {
    return this.bookingRepository.getPublicServices(input)
  }
}
