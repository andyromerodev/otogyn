import type { BlockedTimeSlot } from '../../domain/entities/blocked-time-slot'
import type { DoctorAvailability } from '../../domain/entities/doctor-availability'
import type { AvailabilityRepository } from '../../domain/repositories/availability-repository'

export class MockAvailabilityRepository implements AvailabilityRepository {
  constructor(
    private readonly availability: DoctorAvailability[],
    private readonly blockedSlots: BlockedTimeSlot[],
  ) {}

  async listWeeklyAvailability(organizationId: string): Promise<DoctorAvailability[]> {
    return this.availability.filter((item) => item.organizationId === organizationId)
  }

  async listBlockedSlots(organizationId: string, day: Date): Promise<BlockedTimeSlot[]> {
    const start = new Date(day)
    start.setHours(0, 0, 0, 0)
    const end = new Date(day)
    end.setHours(23, 59, 59, 999)

    return this.blockedSlots.filter(
      (slot) => slot.organizationId === organizationId && slot.startsAt >= start && slot.startsAt <= end,
    )
  }
}
