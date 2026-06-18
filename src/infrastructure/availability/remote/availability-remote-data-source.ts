import type { BlockedTimeSlot } from '../../../domain/entities/blocked-time-slot'
import type { DoctorAvailability } from '../../../domain/entities/doctor-availability'
import type {
  AvailabilityMutationInput,
  AvailabilityUpdateInput,
  BlockedSlotMutationInput,
} from '../../../application/dto/availability-management'

export interface AvailabilityRemoteDataSource {
  listWeeklyAvailability(): Promise<{ availability: DoctorAvailability[]; blockedSlots: BlockedTimeSlot[] }>
  createAvailability(input: AvailabilityMutationInput): Promise<DoctorAvailability>
  updateAvailability(input: AvailabilityUpdateInput): Promise<DoctorAvailability>
  toggleAvailabilityActive(id: string): Promise<DoctorAvailability>
  createBlockedSlot(input: BlockedSlotMutationInput): Promise<BlockedTimeSlot>
  deleteBlockedSlot(id: string): Promise<void>
}
