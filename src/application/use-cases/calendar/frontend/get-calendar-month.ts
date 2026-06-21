import type { CalendarMonthDto } from '../../../dto/calendar'
import type { CalendarRepository } from '../../../ports/calendar-repository'

export class GetCalendarMonthFrontendUseCase {
  constructor(private readonly calendarRepository: CalendarRepository) {}

  execute(referenceDate: string): Promise<CalendarMonthDto> {
    return this.calendarRepository.getCalendarMonth(referenceDate)
  }
}
