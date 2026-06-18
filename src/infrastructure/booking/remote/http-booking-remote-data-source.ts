import type { PublicBookingInput, PublicBookingResult, PublicServiceDto, PublicSlotDto } from '../../../application/dto/public-booking'
import type { BookingRemoteDataSource } from './booking-remote-data-source'

export class HttpBookingRemoteDataSource implements BookingRemoteDataSource {
  getPublicServices(): Promise<PublicServiceDto[]> {
    return $fetch<PublicServiceDto[]>('/api/public/services' as string)
  }

  getPublicSlots(serviceId: string, date: string): Promise<PublicSlotDto[]> {
    return $fetch<PublicSlotDto[]>('/api/public/slots' as string, { query: { serviceId, date } })
  }

  createPublicBooking(input: PublicBookingInput): Promise<PublicBookingResult> {
    return $fetch<PublicBookingResult>('/api/public/booking' as string, { method: 'POST', body: input })
  }
}
