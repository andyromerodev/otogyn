import type { CalendarFreeSlot } from '../../dto/calendar'

interface BusyInterval {
  startsAt: Date
  endsAt: Date
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h! * 60 + m!
}

function minutesToDate(baseDate: Date, minutes: number): Date {
  const result = new Date(baseDate)
  result.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0)
  return result
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
        start: b.startsAt.getHours() * 60 + b.startsAt.getMinutes(),
        end: b.endsAt.getHours() * 60 + b.endsAt.getMinutes(),
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
