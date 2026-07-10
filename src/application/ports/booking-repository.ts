import type { PublicBookingInput, PublicBookingResult, PublicServiceListResult, PublicSlotDto } from '../dto/public-booking'

export interface GetPublicServicesInput {
  search?: string
  page?: number
  pageSize?: number
}

export interface BookingRepository {
  getPublicServices(input?: GetPublicServicesInput): Promise<PublicServiceListResult>
  getPublicSlots(serviceId: string, date: string): Promise<PublicSlotDto[]>
  createPublicBooking(input: PublicBookingInput): Promise<PublicBookingResult>
}
