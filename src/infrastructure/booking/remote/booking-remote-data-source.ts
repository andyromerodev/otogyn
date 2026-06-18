import type { PublicBookingInput, PublicBookingResult, PublicServiceDto, PublicSlotDto } from '../../../application/dto/public-booking'

export interface BookingRemoteDataSource {
  getPublicServices(): Promise<PublicServiceDto[]>
  getPublicSlots(serviceId: string, date: string): Promise<PublicSlotDto[]>
  createPublicBooking(input: PublicBookingInput): Promise<PublicBookingResult>
}
