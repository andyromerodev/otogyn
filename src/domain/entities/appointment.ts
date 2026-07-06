import type { AppointmentStatus } from '../value-objects/appointment-status'

export interface Appointment {
  id: string
  organizationId: string
  patientId: string
  serviceId: string
  agreedPrice: number | null
  professionalId: string | null
  startAt: Date
  endAt: Date
  status: AppointmentStatus
  isUrgent: boolean
  reason: string | null
  notes: string | null
  createdBy: string
  updatedBy: string | null
  createdAt: Date
  updatedAt: Date
  cancelledAt: Date | null
}
