import type { CalendarDayDto, CalendarMonthDto, CalendarWeekDto } from '../../../application/dto/calendar'
import type { CalendarRepository } from '../../../application/ports/calendar-repository'
import type { CalendarRemoteDataSource } from '../remote/calendar-remote-data-source'

export class CalendarRepositoryImpl implements CalendarRepository {
  constructor(private readonly remoteDataSource: CalendarRemoteDataSource) {}

  getCalendarMonth(referenceDate: string): Promise<CalendarMonthDto> {
    return this.remoteDataSource.getCalendarMonth(referenceDate)
  }

  getCalendarDay(date: string): Promise<CalendarDayDto> {
    return this.remoteDataSource.getCalendarDay(date)
  }

  getCalendarWeek(referenceDate: string): Promise<CalendarWeekDto> {
    return this.remoteDataSource.getCalendarWeek(referenceDate)
  }
}
