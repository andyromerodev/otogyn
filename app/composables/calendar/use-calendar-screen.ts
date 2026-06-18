import { calendarServiceLocator } from '~~/src/infrastructure/calendar/service-locator'
import { createCalendarScreen } from '~~/src/presentation/view-models/calendar/calendar-screen'

export const useCalendarScreen = async () => {
  const screen = createCalendarScreen({
    getCalendarDayUseCase: calendarServiceLocator.getCalendarDayUseCase,
    getCalendarWeekUseCase: calendarServiceLocator.getCalendarWeekUseCase,
  })

  await screen.load()

  return screen
}
