import { calendarServiceLocator } from '~~/src/infrastructure/calendar/service-locator'
import { createCalendarScreen } from '~~/src/presentation/view-models/calendar/calendar-screen'

export const useCalendarScreen = async () => {
  const screen = await createCalendarScreen({
    getCalendarMonthUseCase: calendarServiceLocator.getCalendarMonthUseCase,
    getCalendarDayUseCase: calendarServiceLocator.getCalendarDayUseCase,
  })

  return screen
}
