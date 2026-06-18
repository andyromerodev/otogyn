import { BusinessRuleError } from '../../domain/errors/business-rule-error'
import type { BlockedTimeSlot } from '../../domain/entities/blocked-time-slot'
import type { DoctorAvailability } from '../../domain/entities/doctor-availability'
import type {
  AvailabilityRepository,
  CreateBlockedSlotInput,
  SaveAvailabilityInput,
  UpdateAvailabilityInput,
} from '../../domain/repositories/availability-repository'

export class MockAvailabilityRepository implements AvailabilityRepository {
  constructor(
    private readonly availabilities: DoctorAvailability[],
    private readonly blockedSlots: BlockedTimeSlot[],
  ) {}

  async listWeeklyAvailability(organizationId: string): Promise<DoctorAvailability[]> {
    return this.availabilities.filter((a) => a.organizationId === organizationId)
  }

  async listBlockedSlots(organizationId: string, day: Date): Promise<BlockedTimeSlot[]> {
    const start = new Date(day)
    start.setHours(0, 0, 0, 0)

    const end = new Date(day)
    end.setHours(23, 59, 59, 999)

    return this.blockedSlots.filter(
      (slot) =>
        slot.organizationId === organizationId &&
        slot.startsAt < end &&
        slot.endsAt > start,
    )
  }

  async saveAvailability(input: SaveAvailabilityInput): Promise<DoctorAvailability> {
    const existingIndex = this.availabilities.findIndex(
      (a) => a.organizationId === input.organizationId && a.weekday === input.weekday,
    )

    if (existingIndex >= 0) {
      this.availabilities[existingIndex] = {
        ...this.availabilities[existingIndex]!,
        startTime: input.startTime,
        endTime: input.endTime,
        isActive: input.isActive,
      }

      return this.availabilities[existingIndex]!
    }

    const newAvailability: DoctorAvailability = {
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      weekday: input.weekday,
      startTime: input.startTime,
      endTime: input.endTime,
      isActive: input.isActive,
    }

    this.availabilities.push(newAvailability)

    return newAvailability
  }

  async updateAvailability(id: string, input: UpdateAvailabilityInput): Promise<DoctorAvailability> {
    const index = this.availabilities.findIndex((a) => a.id === id)

    if (index === -1) {
      throw new BusinessRuleError('Availability not found.')
    }

    const existing = this.availabilities[index]!

    this.availabilities[index] = {
      ...existing,
      weekday: input.weekday ?? existing.weekday,
      startTime: input.startTime ?? existing.startTime,
      endTime: input.endTime ?? existing.endTime,
      isActive: input.isActive ?? existing.isActive,
    }

    return this.availabilities[index]!
  }

  async toggleAvailabilityActive(id: string, isActive: boolean): Promise<DoctorAvailability> {
    return this.updateAvailability(id, { isActive })
  }

  async createBlockedSlot(input: CreateBlockedSlotInput): Promise<BlockedTimeSlot> {
    if (input.startsAt.getTime() >= input.endsAt.getTime()) {
      throw new BusinessRuleError('Blocked slot start must be before end.')
    }

    const slot: BlockedTimeSlot = {
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      reason: input.reason ?? null,
    }

    this.blockedSlots.push(slot)

    return slot
  }

  async deleteBlockedSlot(id: string): Promise<void> {
    const index = this.blockedSlots.findIndex((slot) => slot.id === id)

    if (index >= 0) {
      this.blockedSlots.splice(index, 1)
    }
  }
}
