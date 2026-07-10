import type { PublicBookingInput, PublicBookingResult, PublicServiceListResult, PublicSlotDto } from '../../../application/dto/public-booking'
import type { GetPublicServicesInput } from '../../../application/ports/booking-repository'
import type { BookingRemoteDataSource } from './booking-remote-data-source'

async function getPublicSecurityToken(action: 'booking'): Promise<string> {
  const response = await $fetch<{ token: string }>('/api/public/security-token' as string, {
    query: { action },
  })

  return response.token
}

export class HttpBookingRemoteDataSource implements BookingRemoteDataSource {
  getPublicServices(input?: GetPublicServicesInput): Promise<PublicServiceListResult> {
    return $fetch<PublicServiceListResult>('/api/public/services' as string, {
      query: {
        search: input?.search,
        page: input?.page,
        pageSize: input?.pageSize,
      },
    })
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
