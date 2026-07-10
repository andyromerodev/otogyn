import type { BlockedTimeSlot } from '../../../domain/entities/blocked-time-slot'
import type { DoctorAvailability } from '../../../domain/entities/doctor-availability'
import type {
  AvailabilityBulkMutationInput,
  AvailabilityMutationInput,
  AvailabilityUpdateInput,
  BlockedSlotBulkMutationInput,
  BlockedSlotMutationInput,
} from '../../../application/dto/availability-management'

export interface AvailabilityViewModelPort<TInput, TResult> {
  execute(input: TInput): Promise<TResult>
}

export interface AvailabilityViewModelDependencies {
  listAvailabilityUseCase: { execute(): Promise<DoctorAvailability[]> }
  listUpcomingBlockedSlotsUseCase: { execute(): Promise<BlockedTimeSlot[]> }
  createAvailabilityUseCase: AvailabilityViewModelPort<AvailabilityMutationInput, DoctorAvailability>
  createBulkAvailabilityUseCase: AvailabilityViewModelPort<AvailabilityBulkMutationInput, DoctorAvailability[]>
  updateAvailabilityUseCase: AvailabilityViewModelPort<AvailabilityUpdateInput, DoctorAvailability>
  toggleAvailabilityActiveUseCase: { execute(id: string): Promise<DoctorAvailability> }
  createBlockedSlotUseCase: AvailabilityViewModelPort<BlockedSlotMutationInput, BlockedTimeSlot>
  createBulkBlockedSlotsUseCase: AvailabilityViewModelPort<BlockedSlotBulkMutationInput, BlockedTimeSlot[]>
  deleteBlockedSlotUseCase: { execute(id: string): Promise<void> }
  getSessionContext: { execute(): Promise<{ role: 'admin_doctor' | 'assistant' }> }
}
