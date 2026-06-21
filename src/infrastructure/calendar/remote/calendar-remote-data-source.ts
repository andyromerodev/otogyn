import type { CalendarDayDto, CalendarMonthDto, CalendarWeekDto } from '../../../application/dto/calendar'

export interface CalendarRemoteDataSource {
  getCalendarMonth(referenceDate: string): Promise<CalendarMonthDto>
  getCalendarDay(date: string): Promise<CalendarDayDto>
  getCalendarWeek(referenceDate: string): Promise<CalendarWeekDto>
}
