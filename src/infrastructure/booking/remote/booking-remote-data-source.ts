import type { PublicBookingInput, PublicBookingResult, PublicServiceListResult, PublicSlotDto } from '../../../application/dto/public-booking'
import type { GetPublicServicesInput } from '../../../application/ports/booking-repository'

export interface BookingRemoteDataSource {
  getPublicServices(input?: GetPublicServicesInput): Promise<PublicServiceListResult>
  getPublicSlots(serviceId: string, date: string): Promise<PublicSlotDto[]>
  createPublicBooking(input: PublicBookingInput): Promise<PublicBookingResult>
}
