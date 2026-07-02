import type { AppointmentListFilter } from '../dto/appointment-management'
import type {
  AppointmentListPageResult,
  AppointmentRepository,
} from '../../domain/repositories/appointment-repository'
import {
  addAppDays,
  createAppDateTime,
  getAppDateParts,
  getAppDayBounds,
  getAppWeekday,
} from '../utils/date/local-date'

export interface ListAppointmentsInput {
  organizationId: string
  search?: string
  filter?: AppointmentListFilter
  page?: number
  pageSize?: number
  now?: Date
}

const getCurrentWeekStart = (now: Date): Date => {
  const { start } = getAppDayBounds(now)
  const weekday = getAppWeekday(start)
  return addAppDays(start, weekday === 0 ? -6 : 1 - weekday)
}

const getCurrentMonthStart = (now: Date): Date => {
  const { year, month } = getAppDateParts(now)
  return createAppDateTime(year, month, 1)
}

const resolveDateRange = (
  filter: AppointmentListFilter,
  now: Date,
): { startAtFrom?: Date; startAtTo?: Date } => {
  if (filter === 'all') return {}

  if (filter === 'today') {
    const { start } = getAppDayBounds(now)
    return { startAtFrom: start, startAtTo: addAppDays(start, 1) }
  }

  if (filter === 'current_week') {
    const start = getCurrentWeekStart(now)
    return { startAtFrom: start, startAtTo: addAppDays(start, 7) }
  }

  if (filter === 'last_week') {
    const currentWeekStart = getCurrentWeekStart(now)
    return { startAtFrom: addAppDays(currentWeekStart, -7), startAtTo: currentWeekStart }
  }

  const currentMonthStart = getCurrentMonthStart(now)

  if (filter === 'current_month') {
    const { year, month } = getAppDateParts(currentMonthStart)
    return { startAtFrom: currentMonthStart, startAtTo: createAppDateTime(year, month + 1, 1) }
  }

  const { year, month } = getAppDateParts(currentMonthStart)
  return { startAtFrom: createAppDateTime(year, month - 1, 1), startAtTo: currentMonthStart }
}

export class ListAppointmentsUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  execute(input: ListAppointmentsInput): Promise<AppointmentListPageResult> {
    const filter = input.filter ?? 'all'
    const range = resolveDateRange(filter, input.now ?? new Date())

    return this.appointmentRepository.listPage({
      organizationId: input.organizationId,
      search: input.search ?? '',
      page: input.page ?? 1,
      pageSize: input.pageSize ?? 10,
      ...range,
    })
  }
}
