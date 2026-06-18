import type { PublicBookingInput, PublicBookingResult } from '../../../dto/public-booking'
import type { BookingRepository } from '../../../ports/booking-repository'

export class CreatePublicBookingFrontendUseCase {
  constructor(private readonly bookingRepository: BookingRepository) {}

  execute(input: PublicBookingInput): Promise<PublicBookingResult> {
    return this.bookingRepository.createPublicBooking(input)
  }
}
