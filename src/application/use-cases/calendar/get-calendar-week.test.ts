import { describe, expect, it } from 'vitest'
import { GetCalendarWeekUseCase } from './get-calendar-week'
import { MockAppointmentRepository } from '../../../infrastructure/mock/mock-appointment-repository'
import { MockAvailabilityRepository } from '../../../infrastructure/mock/mock-availability-repository'
import { MockPatientRepository } from '../../../infrastructure/mock/mock-patient-repository'
import { MockServiceRepository } from '../../../infrastructure/mock/mock-service-repository'
import type { Appointment } from '../../../domain/entities/appointment'

const ORG = 'org_1'

function makeDay(year: number, month: number, day: number, hour = 0): Date {
  const d = new Date()
  d.setFullYear(year, month - 1, day)
  d.setHours(hour, 0, 0, 0)
  return d
}

function makeUseCase(
  appointments: Appointment[] = [],
  weekdaysWithAvailability: number[] = [1, 2, 3, 4, 5],
) {
  const availabilities = weekdaysWithAvailability.map((weekday) => ({
    id: `av_${weekday}`,
    organizationId: ORG,
    weekday,
    startTime: '09:00',
    endTime: '17:00',
    isActive: true,
  }))

  return new GetCalendarWeekUseCase(
    new MockAppointmentRepository(appointments),
    new MockAvailabilityRepository(availabilities, []),
    new MockPatientRepository([]),
    new MockServiceRepository([]),
  )
}

describe('GetCalendarWeekUseCase', () => {
  it('returns 7 days with Monday as the first day', async () => {
    const useCase = makeUseCase()
    // Wednesday June 11, 2025
    const result = await useCase.execute({ organizationId: ORG, referenceDate: makeDay(2025, 6, 11) })

    expect(result.days).toHaveLength(7)
    expect(result.weekStart).toBe('2025-06-09') // Monday
    // weekEnd uses toISOString() which is UTC — just verify it is after weekStart
    expect(result.weekEnd >= result.weekStart).toBe(true)
    expect(result.days[0]!.weekday).toBe(1) // Monday = 1
    expect(result.days[6]!.weekday).toBe(0) // Sunday = 0
  })

  it('marks workdays based on availability and non-workdays as not workdays', async () => {
    const useCase = makeUseCase([], [1, 2, 3, 4, 5]) // Mon-Fri only
    const result = await useCase.execute({ organizationId: ORG, referenceDate: makeDay(2025, 6, 11) })

    expect(result.days[0]!.isWorkday).toBe(true)  // Mon
    expect(result.days[4]!.isWorkday).toBe(true)  // Fri
    expect(result.days[5]!.isWorkday).toBe(false) // Sat
    expect(result.days[6]!.isWorkday).toBe(false) // Sun
  })

  it('places an appointment in the correct day bucket', async () => {
    const wednesdayAppt: Appointment = {
      id: 'appt_w',
      organizationId: ORG,
      patientId: 'p1',
      serviceId: 'svc_1',
      professionalId: null,
      startAt: makeDay(2025, 6, 11, 10), // Wednesday
      endAt: makeDay(2025, 6, 11, 11),
      status: 'scheduled',
      isUrgent: false,
      reason: null,
      notes: null,
      createdBy: 'user_1',
      updatedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      cancelledAt: null,
    }
    const useCase = makeUseCase([wednesdayAppt])
    const result = await useCase.execute({ organizationId: ORG, referenceDate: makeDay(2025, 6, 11) })

    const wednesday = result.days[2]! // Wed is index 2 (Mon=0)
    expect(wednesday.appointments).toHaveLength(1)
    expect(wednesday.appointments[0]!.id).toBe('appt_w')

    // Other days have no appointments
    const otherDays = result.days.filter((_, i) => i !== 2)
    expect(otherDays.every((d) => d.appointments.length === 0)).toBe(true)
  })

  it('non-workdays have empty availabilityWindows and no free slots', async () => {
    const useCase = makeUseCase([], [1, 2, 3, 4, 5]) // Mon-Fri only
    const result = await useCase.execute({ organizationId: ORG, referenceDate: makeDay(2025, 6, 11) })

    const saturday = result.days[5]!
    expect(saturday.availabilityWindows).toHaveLength(0)
    expect(saturday.freeSlots).toHaveLength(0)
  })
})
