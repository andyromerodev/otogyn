import { describe, expect, it, vi } from 'vitest'
import { createCalendarViewModel } from './calendar-view-model'
import type { CalendarViewModelDependencies } from './calendar-view-model'
import type { GetCalendarDayFrontendUseCase } from '../../../application/use-cases/calendar/frontend/get-calendar-day'
import type { GetCalendarMonthFrontendUseCase } from '../../../application/use-cases/calendar/frontend/get-calendar-month'

function createMonthFixture(selectedDate: string): CalendarMonthDto {
  return {
    monthStart: '2026-06-01',
    monthEnd: '2026-06-30',
    selectedDate,
    days: [
      {
        date: '2026-06-01',
        dayOfMonth: 1,
        isCurrentMonth: true,
        isToday: false,
        hasAppointments: false,
        appointmentsCount: 0,
      },
      {
        date: '2026-06-12',
        dayOfMonth: 12,
        isCurrentMonth: true,
        isToday: true,
        hasAppointments: true,
        appointmentsCount: 2,
      },
    ],
  }
}

function createDayFixture(date: string): CalendarDayDto {
  return {
    date,
    weekday: 5,
    isWorkday: true,
    availabilityWindows: [],
    appointments: [],
    blockedSlots: [],
    freeSlots: [],
  }
}

describe('createCalendarViewModel', () => {
  it('loads month and selected day on startup', async () => {
    const getCalendarMonthUseCase = {
      execute: vi.fn().mockResolvedValue(createMonthFixture('2026-06-12')),
    }
    const getCalendarDayUseCase = {
      execute: vi.fn().mockResolvedValue(createDayFixture('2026-06-12')),
    }

    const dependencies: CalendarViewModelDependencies = {
      getCalendarMonthUseCase: { execute: getCalendarMonthUseCase.execute } as GetCalendarMonthFrontendUseCase,
      getCalendarDayUseCase: { execute: getCalendarDayUseCase.execute } as GetCalendarDayFrontendUseCase,
    }

    const screen = await createCalendarViewModel(dependencies)

    expect(getCalendarMonthUseCase.execute).toHaveBeenCalledTimes(1)
    expect(getCalendarDayUseCase.execute).toHaveBeenCalledTimes(1)
    expect(screen.calendarMonth.value?.selectedDate).toBe('2026-06-12')
  })

  it('selects a new day and reloads agenda', async () => {
    const getCalendarMonthUseCase = {
      execute: vi
        .fn()
        .mockResolvedValueOnce(createMonthFixture('2026-06-12'))
        .mockResolvedValueOnce(createMonthFixture('2026-06-18')),
    }
    const getCalendarDayUseCase = {
      execute: vi
        .fn()
        .mockResolvedValueOnce(createDayFixture('2026-06-12'))
        .mockResolvedValueOnce(createDayFixture('2026-06-18')),
    }

    const dependencies: CalendarViewModelDependencies = {
      getCalendarMonthUseCase: { execute: getCalendarMonthUseCase.execute } as GetCalendarMonthFrontendUseCase,
      getCalendarDayUseCase: { execute: getCalendarDayUseCase.execute } as GetCalendarDayFrontendUseCase,
    }

    const screen = await createCalendarViewModel(dependencies)

    await screen.selectDate('2026-06-18')

    expect(screen.calendarMonth.value?.selectedDate).toBe('2026-06-18')
    expect(getCalendarDayUseCase.execute).toHaveBeenLastCalledWith('2026-06-18')
  })

  it('keeps the same day number when navigating to a month that supports it', async () => {
    const getCalendarMonthUseCase = {
      execute: vi
        .fn()
        .mockResolvedValueOnce(createMonthFixture('2026-06-12'))
        .mockResolvedValueOnce(createMonthFixture('2026-07-12')),
    }
    const getCalendarDayUseCase = {
      execute: vi
        .fn()
        .mockResolvedValueOnce(createDayFixture('2026-06-12'))
        .mockResolvedValueOnce(createDayFixture('2026-07-12')),
    }

    const dependencies: CalendarViewModelDependencies = {
      getCalendarMonthUseCase: { execute: getCalendarMonthUseCase.execute } as GetCalendarMonthFrontendUseCase,
      getCalendarDayUseCase: { execute: getCalendarDayUseCase.execute } as GetCalendarDayFrontendUseCase,
    }

    const screen = await createCalendarViewModel(dependencies)

    await screen.selectDate('2026-06-12')
    await screen.goToNextMonth()

    expect(screen.selectedDate.value.getDate()).toBe(12)
    expect(getCalendarMonthUseCase.execute).toHaveBeenLastCalledWith('2026-07-12')
  })

  it('clamps the selected day when the target month has fewer days', async () => {
    const getCalendarMonthUseCase = {
      execute: vi
        .fn()
        .mockResolvedValueOnce(createMonthFixture('2026-01-31'))
        .mockResolvedValueOnce(createMonthFixture('2026-02-28')),
    }
    const getCalendarDayUseCase = {
      execute: vi
        .fn()
        .mockResolvedValueOnce(createDayFixture('2026-01-31'))
        .mockResolvedValueOnce(createDayFixture('2026-02-28')),
    }

    const dependencies: CalendarViewModelDependencies = {
      getCalendarMonthUseCase: { execute: getCalendarMonthUseCase.execute } as GetCalendarMonthFrontendUseCase,
      getCalendarDayUseCase: { execute: getCalendarDayUseCase.execute } as GetCalendarDayFrontendUseCase,
    }

    const screen = await createCalendarViewModel(dependencies)

    await screen.selectDate('2026-01-31')
    await screen.goToNextMonth()

    expect(screen.selectedDate.value.getDate()).toBe(28)
    expect(getCalendarDayUseCase.execute).toHaveBeenLastCalledWith('2026-02-28')
  })
})
