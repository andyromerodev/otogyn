import type { CalendarFreeSlot } from '../../dto/calendar'
import { getAppDateParts, getAppTimeInMinutes, createAppDateTime } from '../../utils/date/local-date'

interface BusyInterval {
  startsAt: Date
  endsAt: Date
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h! * 60 + m!
}

function minutesToDate(baseDate: Date, minutes: number): Date {
  const { year, month, day } = getAppDateParts(baseDate)
  return createAppDateTime(year, month, day, Math.floor(minutes / 60), minutes % 60)
}

export function computeFreeSlots(
  date: Date,
  availabilityWindows: { startTime: string; endTime: string }[],
  busyIntervals: BusyInterval[],
  minDurationMinutes = 15,
): CalendarFreeSlot[] {
  const freeSlots: CalendarFreeSlot[] = []

  for (const window of availabilityWindows) {
    const windowStart = toMinutes(window.startTime)
    const windowEnd = toMinutes(window.endTime)

    const busyRanges = busyIntervals
      .map((b) => ({
        start: getAppTimeInMinutes(b.startsAt),
        end: getAppTimeInMinutes(b.endsAt),
      }))
      .filter((b) => b.start < windowEnd && b.end > windowStart)
      .map((b) => ({
        start: Math.max(windowStart, b.start),
        end: Math.min(windowEnd, b.end),
      }))
      .sort((a, b) => a.start - b.start)

    let cursor = windowStart

    for (const busy of busyRanges) {
      if (cursor < busy.start) {
        const duration = busy.start - cursor
        if (duration >= minDurationMinutes) {
          freeSlots.push({
            startsAt: minutesToDate(date, cursor).toISOString(),
            endsAt: minutesToDate(date, busy.start).toISOString(),
            durationMinutes: duration,
          })
        }
      }
      cursor = Math.max(cursor, busy.end)
    }

    if (cursor < windowEnd) {
      const duration = windowEnd - cursor
      if (duration >= minDurationMinutes) {
        freeSlots.push({
          startsAt: minutesToDate(date, cursor).toISOString(),
          endsAt: minutesToDate(date, windowEnd).toISOString(),
          durationMinutes: duration,
        })
      }
    }
  }

  return freeSlots
}
