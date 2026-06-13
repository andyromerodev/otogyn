export const appointmentStatuses = [
  'scheduled',
  'confirmed',
  'checked_in',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
] as const

export type AppointmentStatus = (typeof appointmentStatuses)[number]

export const activeAppointmentStatuses: AppointmentStatus[] = [
  'scheduled',
  'confirmed',
  'checked_in',
  'in_progress',
]
