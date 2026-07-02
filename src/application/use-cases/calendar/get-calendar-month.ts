import type { CalendarMonthDto } from '../../dto/calendar'
import type { AppointmentRepository } from '../../../domain/repositories/appointment-repository'
import {
  addAppDays,
  createAppDateTime,
  formatLocalDate,
  getAppDateParts,
  getAppDayOfMonth,
  getAppMonth,
  getAppWeekday,
  isSameAppDay,
} from '../../utils/date/local-date'

function startOfMonth(date: Date): Date {
  const { year, month } = getAppDateParts(date)
  return createAppDateTime(year, month, 1)
}

function endOfMonth(date: Date): Date {
  const { year, month } = getAppDateParts(date)
  return new Date(createAppDateTime(year, month + 1, 1).getTime() - 1)
}

function startOfCalendarGrid(monthStart: Date): Date {
  const weekday = getAppWeekday(monthStart)
  const diff = weekday === 0 ? 6 : weekday - 1
  return addAppDays(monthStart, -diff)
}

function endOfCalendarGrid(monthEnd: Date): Date {
  const weekday = getAppWeekday(monthEnd)
  const diff = weekday === 0 ? 0 : 7 - weekday
  const gridEndDay = addAppDays(monthEnd, diff)
  return new Date(addAppDays(gridEndDay, 1).getTime() - 1)
}

export class GetCalendarMonthUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(input: { organizationId: string; referenceDate: Date }): Promise<CalendarMonthDto> {
    const monthStart = startOfMonth(input.referenceDate)
    const monthEnd = endOfMonth(input.referenceDate)
    const gridStart = startOfCalendarGrid(monthStart)
    const gridEnd = endOfCalendarGrid(monthEnd)
    const todayParts = getAppDateParts(new Date())
    const today = createAppDateTime(todayParts.year, todayParts.month, todayParts.day)

    const appointments = await this.appointmentRepository.listByRange(input.organizationId, gridStart, gridEnd)

    const countsByDate = appointments.reduce<Record<string, number>>((accumulator, appointment) => {
      const key = formatLocalDate(appointment.startAt)
      accumulator[key] = (accumulator[key] ?? 0) + 1
      return accumulator
    }, {})

    const days = []
    const cursor = new Date(gridStart)
    const currentMonth = getAppMonth(monthStart)

    while (cursor <= gridEnd) {
      const dateKey = formatLocalDate(cursor)

      days.push({
        date: dateKey,
        dayOfMonth: getAppDayOfMonth(cursor),
        isCurrentMonth: getAppMonth(cursor) === currentMonth,
        isToday: isSameAppDay(cursor, today),
        hasAppointments: (countsByDate[dateKey] ?? 0) > 0,
        appointmentsCount: countsByDate[dateKey] ?? 0,
      })

      cursor.setTime(addAppDays(cursor, 1).getTime())
    }

    return {
      monthStart: formatLocalDate(monthStart),
      monthEnd: formatLocalDate(monthEnd),
      selectedDate: formatLocalDate(input.referenceDate),
      days,
    }
  }
}
