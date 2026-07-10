export interface PublicServiceDto {
  id: string
  name: string
  description: string | null
  defaultDurationMinutes: number
  price: number | null
}

export interface PublicServiceListInput {
  organizationId: string
  search?: string
  page?: number
  pageSize?: number
}

export interface PublicServiceListResult {
  items: PublicServiceDto[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PublicSlotDto {
  startsAt: string
  endsAt: string
  durationMinutes: number
  serviceId: string
}

export interface PublicBookingInput {
  serviceId: string
  startAt: string
  patientName: string
  patientPhone: string
  patientEmail?: string | null
  reason?: string | null
  publicSecurityToken?: string
  website?: string | null
}

export interface PublicBookingResult {
  appointmentId: string
  date: string
  startAt: string
  endAt: string
  serviceName: string
  durationMinutes: number
}
