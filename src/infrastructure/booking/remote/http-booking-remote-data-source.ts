import type { PublicBookingInput, PublicBookingResult, PublicServiceDto, PublicSlotDto } from '../../../application/dto/public-booking'
import type { BookingRemoteDataSource } from './booking-remote-data-source'

async function getPublicSecurityToken(action: 'booking'): Promise<string> {
  const response = await $fetch<{ token: string }>('/api/public/security-token' as string, {
    query: { action },
  })

  return response.token
}

export class HttpBookingRemoteDataSource implements BookingRemoteDataSource {
  getPublicServices(): Promise<PublicServiceDto[]> {
    return $fetch<PublicServiceDto[]>('/api/public/services' as string)
  }

  getPublicSlots(serviceId: string, date: string): Promise<PublicSlotDto[]> {
    return $fetch<PublicSlotDto[]>('/api/public/slots' as string, { query: { serviceId, date } })
  }

  async createPublicBooking(input: PublicBookingInput): Promise<PublicBookingResult> {
    const publicSecurityToken = await getPublicSecurityToken('booking')

    return $fetch<PublicBookingResult>('/api/public/booking' as string, {
      method: 'POST',
      body: { ...input, publicSecurityToken },
    })
  }
}
