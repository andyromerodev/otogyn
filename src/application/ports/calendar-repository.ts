import type { CalendarDayDto, CalendarMonthDto, CalendarWeekDto } from '../dto/calendar'

export interface CalendarRepository {
  getCalendarMonth(referenceDate: string): Promise<CalendarMonthDto>
  getCalendarDay(date: string): Promise<CalendarDayDto>
  getCalendarWeek(referenceDate: string): Promise<CalendarWeekDto>
}
