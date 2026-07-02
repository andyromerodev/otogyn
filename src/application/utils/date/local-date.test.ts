import { describe, expect, it } from 'vitest'
import {
  formatLocalDate,
  getAppWeekday,
  parseAppDateTime,
  parseLocalDate,
  toAppDatetimeLocalValue,
  toAppSortableTimeLabel,
} from './local-date'

describe('local-date app timezone helpers', () => {
  it('interprets datetime-local values as Lima wall time', () => {
    const date = parseAppDateTime('2026-07-02T09:00')

    expect(date.toISOString()).toBe('2026-07-02T14:00:00.000Z')
    expect(toAppDatetimeLocalValue(date)).toBe('2026-07-02T09:00')
    expect(toAppSortableTimeLabel(date)).toBe('09:00')
  })

  it('keeps explicit UTC instants but formats them as Lima dates', () => {
    const date = parseAppDateTime('2026-07-02T14:00:00.000Z')

    expect(formatLocalDate(date)).toBe('2026-07-02')
    expect(toAppDatetimeLocalValue(date)).toBe('2026-07-02T09:00')
  })

  it('parses calendar dates as Lima midnight', () => {
    const date = parseLocalDate('2026-07-02')

    expect(date.toISOString()).toBe('2026-07-02T05:00:00.000Z')
    expect(getAppWeekday(date)).toBe(4)
  })
})
