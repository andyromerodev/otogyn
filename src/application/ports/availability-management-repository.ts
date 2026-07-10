import type { BlockedTimeSlot } from '../../domain/entities/blocked-time-slot'
import type { DoctorAvailability } from '../../domain/entities/doctor-availability'
import type {
  AvailabilityBulkMutationInput,
  AvailabilityListResult,
  AvailabilityMutationInput,
  AvailabilityUpdateInput,
  BlockedSlotBulkMutationInput,
  BlockedSlotListResult,
  BlockedSlotMutationInput,
} from '../dto/availability-management'

export interface AvailabilityManagementRepository {
  listWeeklyAvailability(): Promise<AvailabilityListResult>
  listBlockedSlots(day?: string): Promise<BlockedSlotListResult>
  listUpcomingBlockedSlots(): Promise<BlockedSlotListResult>
  createAvailability(input: AvailabilityMutationInput): Promise<DoctorAvailability>
  createBulkAvailability(input: AvailabilityBulkMutationInput): Promise<DoctorAvailability[]>
  updateAvailability(input: AvailabilityUpdateInput): Promise<DoctorAvailability>
  toggleAvailabilityActive(id: string): Promise<DoctorAvailability>
  createBlockedSlot(input: BlockedSlotMutationInput): Promise<BlockedTimeSlot>
  createBulkBlockedSlots(input: BlockedSlotBulkMutationInput): Promise<BlockedTimeSlot[]>
  deleteBlockedSlot(id: string): Promise<void>
}
