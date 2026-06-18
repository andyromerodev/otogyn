import type { BlockedTimeSlot } from '../../../domain/entities/blocked-time-slot'
import type { DoctorAvailability } from '../../../domain/entities/doctor-availability'
import type { AvailabilityManagementRepository } from '../../../application/ports/availability-management-repository'
import type {
  AvailabilityMutationInput,
  AvailabilityUpdateInput,
  BlockedSlotMutationInput,
} from '../../../application/dto/availability-management'
import type { AvailabilityRemoteDataSource } from '../remote/availability-remote-data-source'

export class AvailabilityManagementRepositoryImpl implements AvailabilityManagementRepository {
  constructor(private readonly remoteDataSource: AvailabilityRemoteDataSource) {}

  async listWeeklyAvailability(): Promise<DoctorAvailability[]> {
    const result = await this.remoteDataSource.listWeeklyAvailability()
    return result.availability
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async listBlockedSlots(_day?: string): Promise<BlockedTimeSlot[]> {
    const result = await this.remoteDataSource.listWeeklyAvailability()
    return result.blockedSlots
  }

  async createAvailability(input: AvailabilityMutationInput): Promise<DoctorAvailability> {
    return this.remoteDataSource.createAvailability(input)
  }

  async updateAvailability(input: AvailabilityUpdateInput): Promise<DoctorAvailability> {
    return this.remoteDataSource.updateAvailability(input)
  }

  async toggleAvailabilityActive(id: string): Promise<DoctorAvailability> {
    return this.remoteDataSource.toggleAvailabilityActive(id)
  }

  async createBlockedSlot(input: BlockedSlotMutationInput): Promise<BlockedTimeSlot> {
    return this.remoteDataSource.createBlockedSlot(input)
  }

  async deleteBlockedSlot(id: string): Promise<void> {
    return this.remoteDataSource.deleteBlockedSlot(id)
  }
}
