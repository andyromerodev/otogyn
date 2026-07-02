import { setAppTime, toAppDatetimeLocalValue } from '../../../application/utils/date/local-date'
import type { AppointmentStatus } from '../../../domain/value-objects/appointment-status'

// Equivale a la interfaz genérica de UseCase en Android (ej. AppointmentUseCase<TInput, TResult>)
export interface AppointmentViewModelPort<TInput, TResult> {
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
  return toAppDatetimeLocalValue(date)
}

export const defaultStartAt = () => {
  return toDatetimeLocalValue(setAppTime(new Date(), 9))
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

export interface NormalizedApiError {
  message: string
  // 'validation': error de negocio o de datos (4xx), accionable por el usuario.
  // 'server': error tecnico/inesperado (5xx o sin respuesta), sugiere reintentar.
  kind: 'validation' | 'server'
}

const extractStatusCode = (error: unknown): number | undefined => {
  if (error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number') {
    return error.statusCode
  }
  return undefined
}

// ofetch expone `error.statusMessage` como getter sobre el "reason phrase" HTTP
// (`response.statusText`), no sobre el JSON de la respuesta. h3 sanea ese
// reason phrase eliminando cualquier caracter fuera de ASCII imprimible antes
// de enviarlo (ver sanitizeStatusMessage en h3), asi que un mensaje con tildes
// como "no esta disponible" llegaria mutilado. El mensaje real, intacto, esta
// en el cuerpo JSON de la respuesta (`error.data`).
const extractServerMessage = (error: unknown): string | undefined => {
  if (!error || typeof error !== 'object' || !('data' in error)) return undefined

  const data = error.data
  if (!data || typeof data !== 'object') return undefined

  if ('statusMessage' in data && typeof data.statusMessage === 'string') return data.statusMessage
  if ('message' in data && typeof data.message === 'string') return data.message

  return undefined
}

export const normalizeApiError = (error: unknown, fallback: string): NormalizedApiError => {
  const statusCode = extractStatusCode(error)

  return {
    message: extractServerMessage(error) ?? fallback,
    kind: statusCode !== undefined && statusCode < 500 ? 'validation' : 'server',
  }
}
