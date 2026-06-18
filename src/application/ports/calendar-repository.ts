import type { CalendarDayDto, CalendarWeekDto } from '../dto/calendar'

export interface CalendarRepository {
  getCalendarDay(date: string): Promise<CalendarDayDto>
  getCalendarWeek(referenceDate: string): Promise<CalendarWeekDto>
}
