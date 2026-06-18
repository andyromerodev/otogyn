import type { PublicSlotDto } from '../../../dto/public-booking'
import type { BookingRepository } from '../../../ports/booking-repository'

export class GetPublicSlotsFrontendUseCase {
  constructor(private readonly bookingRepository: BookingRepository) {}

  execute(serviceId: string, date: string): Promise<PublicSlotDto[]> {
    return this.bookingRepository.getPublicSlots(serviceId, date)
  }
}
