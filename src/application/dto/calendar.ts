import type { AppointmentStatus } from '../../domain/value-objects/appointment-status'

export interface CalendarAvailabilityWindow {
  startTime: string
  endTime: string
}

export interface CalendarAppointmentItem {
  id: string
  patientName: string
  serviceName: string
  startAt: string
  endAt: string
  durationMinutes: number
  status: AppointmentStatus
  statusLabel: string
  isUrgent: boolean
}

export interface CalendarBlockedSlotItem {
  id: string
  startsAt: string
  endsAt: string
  reason: string | null
}

export interface CalendarFreeSlot {
  startsAt: string
  endsAt: string
  durationMinutes: number
}

export interface CalendarDayDto {
  date: string
  weekday: number
  isWorkday: boolean
  availabilityWindows: CalendarAvailabilityWindow[]
  appointments: CalendarAppointmentItem[]
  blockedSlots: CalendarBlockedSlotItem[]
  freeSlots: CalendarFreeSlot[]
}

export interface CalendarWeekDto {
  weekStart: string
  weekEnd: string
  days: CalendarDayDto[]
}
