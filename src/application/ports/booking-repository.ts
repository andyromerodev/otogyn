import type { PublicBookingInput, PublicBookingResult, PublicServiceDto, PublicSlotDto } from '../dto/public-booking'

export interface BookingRepository {
  getPublicServices(): Promise<PublicServiceDto[]>
  getPublicSlots(serviceId: string, date: string): Promise<PublicSlotDto[]>
  createPublicBooking(input: PublicBookingInput): Promise<PublicBookingResult>
}
