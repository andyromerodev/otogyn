export const APP_TIME_ZONE = 'America/Lima'
export const APP_TIME_ZONE_OFFSET_HOURS = 5

const explicitTimeZonePattern = /(?:Z|[+-]\d{2}:\d{2})$/i

const appDatePartsFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

const appTimeFormatter = new Intl.DateTimeFormat('es-PE', {
  timeZone: APP_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
})

export interface AppDateParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

export function getAppDateParts(date: Date): AppDateParts {
  const values = Object.fromEntries(
    appDatePartsFormatter
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]),
  )

  return {
    year: values.year!,
    month: values.month!,
    day: values.day!,
    hour: values.hour!,
    minute: values.minute!,
    second: values.second!,
  }
}

export function createAppDateTime(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0,
): Date {
  return new Date(Date.UTC(year, month - 1, day, hour + APP_TIME_ZONE_OFFSET_HOURS, minute, second, millisecond))
}

export function formatLocalDate(date: Date): string {
  const { year, month, day } = getAppDateParts(date)

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return createAppDateTime(year!, month!, day!)
}

export function parseAppDateTime(value: string): Date {
  if (explicitTimeZonePattern.test(value)) {
    return new Date(value)
  }

  const normalized = value.length === 16 ? `${value}:00` : value
  const [datePart, timePart] = normalized.split('T')
  const [year, month, day] = datePart!.split('-').map(Number)
  const [hour, minute, second = 0] = timePart!.split(':').map(Number)

  return createAppDateTime(year!, month!, day!, hour!, minute!, second)
}

export function getAppDayBounds(date: Date): { start: Date; end: Date } {
  const { year, month, day } = getAppDateParts(date)
  const start = createAppDateTime(year, month, day)
  const end = new Date(createAppDateTime(year, month, day + 1).getTime() - 1)

  return { start, end }
}

export function getAppWeekday(date: Date): number {
  const { year, month, day } = getAppDateParts(date)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

export function getAppDayOfMonth(date: Date): number {
  return getAppDateParts(date).day
}

export function getAppMonth(date: Date): number {
  return getAppDateParts(date).month - 1
}

export function getAppTimeInMinutes(date: Date): number {
  const { hour, minute } = getAppDateParts(date)
  return hour * 60 + minute
}

export function toAppTimeLabel(date: Date): string {
  return appTimeFormatter.format(date)
}

export function toAppSortableTimeLabel(date: Date): string {
  const { hour, minute } = getAppDateParts(date)
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export function toAppDatetimeLocalValue(date: Date): string {
  const { year, month, day, hour, minute } = getAppDateParts(date)
  return [
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
  ].join('T')
}

export function addAppDays(date: Date, days: number): Date {
  const { year, month, day } = getAppDateParts(date)
  return createAppDateTime(year, month, day + days)
}

export function setAppTime(date: Date, hour: number, minute = 0, second = 0, millisecond = 0): Date {
  const { year, month, day } = getAppDateParts(date)
  return createAppDateTime(year, month, day, hour, minute, second, millisecond)
}

export function isSameAppDay(left: Date, right: Date): boolean {
  return formatLocalDate(left) === formatLocalDate(right)
}
