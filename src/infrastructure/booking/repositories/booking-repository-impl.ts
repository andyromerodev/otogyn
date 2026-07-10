import type { PublicBookingInput, PublicBookingResult, PublicServiceListResult, PublicSlotDto } from '../../../application/dto/public-booking'
import type { BookingRepository, GetPublicServicesInput } from '../../../application/ports/booking-repository'
import type { BookingRemoteDataSource } from '../remote/booking-remote-data-source'

export class BookingRepositoryImpl implements BookingRepository {
  constructor(private readonly remoteDataSource: BookingRemoteDataSource) {}

  getPublicServices(input?: GetPublicServicesInput): Promise<PublicServiceListResult> {
    return this.remoteDataSource.getPublicServices(input)
  }

  getPublicSlots(serviceId: string, date: string): Promise<PublicSlotDto[]> {
    return this.remoteDataSource.getPublicSlots(serviceId, date)
  }

  createPublicBooking(input: PublicBookingInput): Promise<PublicBookingResult> {
    return this.remoteDataSource.createPublicBooking(input)
  }
}
