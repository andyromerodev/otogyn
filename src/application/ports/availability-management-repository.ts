import type { BlockedTimeSlot } from '../../domain/entities/blocked-time-slot'
import type { DoctorAvailability } from '../../domain/entities/doctor-availability'
import type {
  AvailabilityListResult,
  AvailabilityMutationInput,
  AvailabilityUpdateInput,
  BlockedSlotListResult,
  BlockedSlotMutationInput,
} from '../dto/availability-management'

export interface AvailabilityManagementRepository {
  listWeeklyAvailability(): Promise<AvailabilityListResult>
  listBlockedSlots(day?: string): Promise<BlockedSlotListResult>
  createAvailability(input: AvailabilityMutationInput): Promise<DoctorAvailability>
  updateAvailability(input: AvailabilityUpdateInput): Promise<DoctorAvailability>
  toggleAvailabilityActive(id: string): Promise<DoctorAvailability>
  createBlockedSlot(input: BlockedSlotMutationInput): Promise<BlockedTimeSlot>
  deleteBlockedSlot(id: string): Promise<void>
}
