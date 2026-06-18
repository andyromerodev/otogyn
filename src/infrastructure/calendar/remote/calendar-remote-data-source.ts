import type { CalendarDayDto, CalendarWeekDto } from '../../../application/dto/calendar'

export interface CalendarRemoteDataSource {
  getCalendarDay(date: string): Promise<CalendarDayDto>
  getCalendarWeek(referenceDate: string): Promise<CalendarWeekDto>
}
