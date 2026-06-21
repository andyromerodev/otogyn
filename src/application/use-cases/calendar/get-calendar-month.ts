import type { CalendarMonthDto } from '../../dto/calendar'
import type { AppointmentRepository } from '../../../domain/repositories/appointment-repository'
import { formatLocalDate } from '../../utils/date/local-date'

function startOfMonth(date: Date): Date {
  const value = new Date(date)
  value.setDate(1)
  value.setHours(0, 0, 0, 0)
  return value
}

function endOfMonth(date: Date): Date {
  const value = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  value.setHours(23, 59, 59, 999)
  return value
}

function startOfCalendarGrid(monthStart: Date): Date {
  const value = new Date(monthStart)
  const weekday = value.getDay()
  const diff = weekday === 0 ? 6 : weekday - 1
  value.setDate(value.getDate() - diff)
  value.setHours(0, 0, 0, 0)
  return value
}

function endOfCalendarGrid(monthEnd: Date): Date {
  const value = new Date(monthEnd)
  const weekday = value.getDay()
  const diff = weekday === 0 ? 0 : 7 - weekday
  value.setDate(value.getDate() + diff)
  value.setHours(23, 59, 59, 999)
  return value
}

function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

export class GetCalendarMonthUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(input: { organizationId: string; referenceDate: Date }): Promise<CalendarMonthDto> {
    const monthStart = startOfMonth(input.referenceDate)
    const monthEnd = endOfMonth(input.referenceDate)
    const gridStart = startOfCalendarGrid(monthStart)
    const gridEnd = endOfCalendarGrid(monthEnd)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const appointments = await this.appointmentRepository.listByRange(input.organizationId, gridStart, gridEnd)

    const countsByDate = appointments.reduce<Record<string, number>>((accumulator, appointment) => {
      const key = formatLocalDate(appointment.startAt)
      accumulator[key] = (accumulator[key] ?? 0) + 1
      return accumulator
    }, {})

    const days = []
    const cursor = new Date(gridStart)

    while (cursor <= gridEnd) {
      const dateKey = formatLocalDate(cursor)

      days.push({
        date: dateKey,
        dayOfMonth: cursor.getDate(),
        isCurrentMonth: cursor.getMonth() === monthStart.getMonth(),
        isToday: isSameDay(cursor, today),
        hasAppointments: (countsByDate[dateKey] ?? 0) > 0,
        appointmentsCount: countsByDate[dateKey] ?? 0,
      })

      cursor.setDate(cursor.getDate() + 1)
    }

    return {
      monthStart: formatLocalDate(monthStart),
      monthEnd: formatLocalDate(monthEnd),
      selectedDate: formatLocalDate(input.referenceDate),
      days,
    }
  }
}
