import { GetCalendarMonthFrontendUseCase } from '../../application/use-cases/calendar/frontend/get-calendar-month'
import { GetCalendarDayFrontendUseCase } from '../../application/use-cases/calendar/frontend/get-calendar-day'
import { GetCalendarWeekFrontendUseCase } from '../../application/use-cases/calendar/frontend/get-calendar-week'
import { HttpCalendarRemoteDataSource } from './remote/http-calendar-remote-data-source'
import { CalendarRepositoryImpl } from './repositories/calendar-repository-impl'

const calendarRemoteDataSource = new HttpCalendarRemoteDataSource()
const calendarRepository = new CalendarRepositoryImpl(calendarRemoteDataSource)

export const calendarServiceLocator = {
  getCalendarMonthUseCase: new GetCalendarMonthFrontendUseCase(calendarRepository),
  getCalendarDayUseCase: new GetCalendarDayFrontendUseCase(calendarRepository),
  getCalendarWeekUseCase: new GetCalendarWeekFrontendUseCase(calendarRepository),
}
