import type { CalendarDayDto, CalendarWeekDto } from '../../../application/dto/calendar'
import type { CalendarRemoteDataSource } from './calendar-remote-data-source'

export class HttpCalendarRemoteDataSource implements CalendarRemoteDataSource {
  getCalendarDay(date: string): Promise<CalendarDayDto> {
    return $fetch<CalendarDayDto>('/api/calendar/day' as string, { query: { date } })
  }

  getCalendarWeek(referenceDate: string): Promise<CalendarWeekDto> {
    return $fetch<CalendarWeekDto>('/api/calendar/week' as string, { query: { date: referenceDate } })
  }
}
