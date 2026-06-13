import type { BlockedTimeSlot } from '../entities/blocked-time-slot'
import type { DoctorAvailability } from '../entities/doctor-availability'

export interface AvailabilityRepository {
  listWeeklyAvailability(organizationId: string): Promise<DoctorAvailability[]>
  listBlockedSlots(organizationId: string, day: Date): Promise<BlockedTimeSlot[]>
}
