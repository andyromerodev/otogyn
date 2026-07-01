import type { GetCalendarDayFrontendUseCase } from '../../../application/use-cases/calendar/frontend/get-calendar-day'
import type { GetCalendarMonthFrontendUseCase } from '../../../application/use-cases/calendar/frontend/get-calendar-month'

// Equivale al módulo de Koin donde declaras viewModel { CalendarViewModel(get(), get()) }
export interface CalendarViewModelDependencies {
  getCalendarMonthUseCase: GetCalendarMonthFrontendUseCase
  getCalendarDayUseCase: GetCalendarDayFrontendUseCase
}
