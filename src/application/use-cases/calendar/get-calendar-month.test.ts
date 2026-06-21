import { describe, expect, it } from 'vitest'
import { GetCalendarMonthUseCase } from './get-calendar-month'
import { MockAppointmentRepository } from '../../../infrastructure/mock/mock-appointment-repository'
import type { Appointment } from '../../../domain/entities/appointment'

const ORG = 'org_1'

function makeDate(year: number, month: number, day: number, hour = 9): Date {
  const date = new Date()
  date.setFullYear(year, month - 1, day)
  date.setHours(hour, 0, 0, 0)
  return date
}

describe('GetCalendarMonthUseCase', () => {
  it('returns a full monday-first month grid', async () => {
    const useCase = new GetCalendarMonthUseCase(new MockAppointmentRepository([]))

    const result = await useCase.execute({
      organizationId: ORG,
      referenceDate: makeDate(2026, 6, 12),
    })

    expect(result.monthStart).toBe('2026-06-01')
    expect(result.monthEnd).toBe('2026-06-30')
    expect(result.days.length).toBeGreaterThanOrEqual(35)
    expect(result.days[0]?.date).toBe('2026-06-01')
    expect(result.days.at(-1)?.date).toBe('2026-07-05')
  })

  it('marks only days with real appointments', async () => {
    const appointments: Appointment[] = [
      {
        id: 'appt_1',
        organizationId: ORG,
        patientId: 'p1',
        serviceId: 's1',
        professionalId: null,
        startAt: makeDate(2026, 6, 12, 10),
        endAt: makeDate(2026, 6, 12, 11),
        status: 'confirmed',
        isUrgent: false,
        reason: null,
        notes: null,
        createdBy: 'u1',
        updatedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        cancelledAt: null,
      },
    ]

    const useCase = new GetCalendarMonthUseCase(new MockAppointmentRepository(appointments))

    const result = await useCase.execute({
      organizationId: ORG,
      referenceDate: makeDate(2026, 6, 12),
    })

    const selectedDay = result.days.find((day) => day.date === '2026-06-12')
    const otherDay = result.days.find((day) => day.date === '2026-06-13')

    expect(selectedDay?.hasAppointments).toBe(true)
    expect(selectedDay?.appointmentsCount).toBe(1)
    expect(otherDay?.hasAppointments).toBe(false)
    expect(otherDay?.appointmentsCount).toBe(0)
  })
})
