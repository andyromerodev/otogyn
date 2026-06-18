import type { BlockedTimeSlot } from '../entities/blocked-time-slot'
import type { DoctorAvailability } from '../entities/doctor-availability'

export interface SaveAvailabilityInput {
  organizationId: string
  weekday: number
  startTime: string
  endTime: string
  isActive: boolean
}

export interface UpdateAvailabilityInput {
  weekday?: number
  startTime?: string
  endTime?: string
  isActive?: boolean
}

export interface CreateBlockedSlotInput {
  organizationId: string
  startsAt: Date
  endsAt: Date
  reason?: string | null
}

export interface AvailabilityRepository {
  listWeeklyAvailability(organizationId: string): Promise<DoctorAvailability[]>
  listBlockedSlots(organizationId: string, day: Date): Promise<BlockedTimeSlot[]>
  listBlockedSlotsRange(organizationId: string, start: Date, end: Date): Promise<BlockedTimeSlot[]>
  saveAvailability(input: SaveAvailabilityInput): Promise<DoctorAvailability>
  updateAvailability(id: string, input: UpdateAvailabilityInput): Promise<DoctorAvailability>
  toggleAvailabilityActive(id: string, isActive: boolean): Promise<DoctorAvailability>
  createBlockedSlot(input: CreateBlockedSlotInput): Promise<BlockedTimeSlot>
  deleteBlockedSlot(id: string): Promise<void>
}
