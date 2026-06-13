import type { AppointmentStatus } from '../value-objects/appointment-status'

export interface AppointmentStatusHistory {
  id: string
  appointmentId: string
  previousStatus: AppointmentStatus | null
  nextStatus: AppointmentStatus
  changedBy: string
  createdAt: Date
}
