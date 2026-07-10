export type AppointmentStatsRange = 'week' | 'month' | 'year'

export interface AppointmentStatsMonthDto {
  monthKey: string
  monthShortLabel: string
  completed: number
  cancelled: number
  no_show: number
  total: number
}

export interface AppointmentStatsByServiceDto {
  serviceName: string
  count: number
}

export interface AppointmentStatsByWeekdayDto {
  weekday: number
  label: string
  count: number
}

export interface AppointmentStatsDto {
  range: AppointmentStatsRange
  total: number
  completed: number
  cancelled: number
  no_show: number
  scheduled: number
  confirmed: number
  urgent: number
  cancellationRate: number
  avgDurationMinutes: number | null
  monthlySeries: AppointmentStatsMonthDto[]
  byService: AppointmentStatsByServiceDto[]
  byWeekday: AppointmentStatsByWeekdayDto[]
}
