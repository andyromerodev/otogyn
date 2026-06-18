import type { PublicBookingInput, PublicBookingResult, PublicServiceDto, PublicSlotDto } from '../../../application/dto/public-booking'
import type { BookingRepository } from '../../../application/ports/booking-repository'
import type { BookingRemoteDataSource } from '../remote/booking-remote-data-source'

export class BookingRepositoryImpl implements BookingRepository {
  constructor(private readonly remoteDataSource: BookingRemoteDataSource) {}

  getPublicServices(): Promise<PublicServiceDto[]> {
    return this.remoteDataSource.getPublicServices()
  }

  getPublicSlots(serviceId: string, date: string): Promise<PublicSlotDto[]> {
    return this.remoteDataSource.getPublicSlots(serviceId, date)
  }

  createPublicBooking(input: PublicBookingInput): Promise<PublicBookingResult> {
    return this.remoteDataSource.createPublicBooking(input)
  }
}
