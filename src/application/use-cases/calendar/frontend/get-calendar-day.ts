import type { CalendarDayDto } from '../../../dto/calendar'
import type { CalendarRepository } from '../../../ports/calendar-repository'

export class GetCalendarDayFrontendUseCase {
  constructor(private readonly calendarRepository: CalendarRepository) {}

  execute(date: string): Promise<CalendarDayDto> {
    return this.calendarRepository.getCalendarDay(date)
  }
}
