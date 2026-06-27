import type { AppointmentStatus } from '../../../domain/value-objects/appointment-status'

export interface AppointmentScreenPort<TInput, TResult> {
  execute(input: TInput): Promise<TResult>
}

export interface AppointmentFormState {
  patientId: string
  serviceId: string
  startAt: string
  isUrgent: boolean
  reason: string
  notes: string
}

export const toDatetimeLocalValue = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 16)
}

export const defaultStartAt = () => {
  const date = new Date()
  date.setHours(9, 0, 0, 0)
  return toDatetimeLocalValue(date)
}

export const fromIsoToDatetimeLocalValue = (value: string) => {
  const date = new Date(value)
  return toDatetimeLocalValue(date)
}

export const createInitialAppointmentForm = (): AppointmentFormState => ({
  patientId: '',
  serviceId: '',
  startAt: defaultStartAt(),
  isUrgent: false,
  reason: '',
  notes: '',
})

export const appointmentStatusesForUi: Array<{
  value: Exclude<AppointmentStatus, 'cancelled'>
  label: string
}> = [
  { value: 'scheduled', label: 'Programada' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'checked_in', label: 'En sala' },
  { value: 'in_progress', label: 'En consulta' },
  { value: 'completed', label: 'Completada' },
  { value: 'no_show', label: 'No asistio' },
]

export const normalizeApiError = (error: unknown, fallback: string): string =>
  error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
    ? error.statusMessage
    : fallback
