import { calendarServiceLocator } from '~~/src/infrastructure/calendar/service-locator'
import { createCalendarViewModel } from '~~/src/presentation/view-models/calendar/calendar-view-model'

export const useCalendarViewModel = async () => {
  return await createCalendarViewModel({
    getCalendarMonthUseCase: calendarServiceLocator.getCalendarMonthUseCase,
    getCalendarDayUseCase: calendarServiceLocator.getCalendarDayUseCase,
  })
}
