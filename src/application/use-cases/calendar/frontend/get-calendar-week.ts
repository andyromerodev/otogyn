import type { CalendarWeekDto } from '../../../dto/calendar'
import type { CalendarRepository } from '../../../ports/calendar-repository'

export class GetCalendarWeekFrontendUseCase {
  constructor(private readonly calendarRepository: CalendarRepository) {}

  execute(referenceDate: string): Promise<CalendarWeekDto> {
    return this.calendarRepository.getCalendarWeek(referenceDate)
  }
}
