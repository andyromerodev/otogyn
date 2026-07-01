import type { BlockedTimeSlot } from '../../../domain/entities/blocked-time-slot'
import type { DoctorAvailability } from '../../../domain/entities/doctor-availability'
import type { AvailabilityMutationInput, BlockedSlotMutationInput, AvailabilityUpdateInput } from '../../../application/dto/availability-management'

// Equivale a la interfaz genérica de UseCase en Android (ej. AvailabilityUseCase<TInput, TResult>)
export interface AvailabilityViewModelPort<TInput, TResult> {
  execute(input: TInput): Promise<TResult>
}

// Equivale al módulo de Koin donde declaras viewModel { AvailabilityViewModel(get(), get(), ...) }
export interface AvailabilityViewModelDependencies {
  listAvailabilityUseCase: { execute(): Promise<DoctorAvailability[]> }
  createAvailabilityUseCase: AvailabilityViewModelPort<AvailabilityMutationInput, DoctorAvailability>
  updateAvailabilityUseCase: AvailabilityViewModelPort<AvailabilityUpdateInput, DoctorAvailability>
  toggleAvailabilityActiveUseCase: { execute(id: string): Promise<DoctorAvailability> }
  createBlockedSlotUseCase: AvailabilityViewModelPort<BlockedSlotMutationInput, BlockedTimeSlot>
  deleteBlockedSlotUseCase: { execute(id: string): Promise<void> }
  getSessionContext: { execute(): Promise<{ role: 'admin_doctor' | 'assistant' }> }
}
