import type { PublicSlotDto } from '../../dto/public-booking'
import type { AppointmentRepository } from '../../../domain/repositories/appointment-repository'
import type { AvailabilityRepository } from '../../../domain/repositories/availability-repository'
import type { ServiceRepository } from '../../../domain/repositories/service-repository'
import { activeAppointmentStatuses } from '../../../domain/value-objects/appointment-status'
import { computeFreeSlots } from '../calendar/free-slots'

function generateSlotsInWindow(
  freeWindow: { startsAt: string; endsAt: string },
  durationMinutes: number,
  serviceId: string,
): PublicSlotDto[] {
  const slots: PublicSlotDto[] = []
  const windowEnd = new Date(freeWindow.endsAt).getTime()
  let cursor = new Date(freeWindow.startsAt).getTime()

  while (cursor + durationMinutes * 60000 <= windowEnd) {
    const slotEnd = cursor + durationMinutes * 60000
    slots.push({
      startsAt: new Date(cursor).toISOString(),
      endsAt: new Date(slotEnd).toISOString(),
      durationMinutes,
      serviceId,
    })
    cursor = slotEnd
  }

  return slots
}

export class GetPublicSlotsUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly serviceRepository: ServiceRepository,
  ) {}

  async execute(input: {
    organizationId: string
    date: Date
    serviceId: string
  }): Promise<PublicSlotDto[]> {
    const service = await this.serviceRepository.findById(input.serviceId)
    if (!service || !service.isActive) return []

    const dayStart = new Date(input.date)
    dayStart.setHours(0, 0, 0, 0)

    const [appointments, weeklyAvailability, blockedSlots] = await Promise.all([
      this.appointmentRepository.listByDay(input.organizationId, input.date),
      this.availabilityRepository.listWeeklyAvailability(input.organizationId),
      this.availabilityRepository.listBlockedSlots(input.organizationId, input.date),
    ])

    const weekday = input.date.getDay()
    const activeWindows = weeklyAvailability
      .filter((a) => a.weekday === weekday && a.isActive)
      .map((a) => ({ startTime: a.startTime, endTime: a.endTime }))

    const busyIntervals = [
      ...appointments
        .filter((a) => (activeAppointmentStatuses as string[]).includes(a.status))
        .map((a) => ({ startsAt: a.startAt, endsAt: a.endAt })),
      ...blockedSlots.map((b) => ({ startsAt: b.startsAt, endsAt: b.endsAt })),
    ]

    const freeWindows = computeFreeSlots(dayStart, activeWindows, busyIntervals, service.defaultDurationMinutes)

    return freeWindows.flatMap((window) =>
      generateSlotsInWindow(window, service.defaultDurationMinutes, service.id),
    )
  }
}
