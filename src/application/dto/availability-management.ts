import type { BlockedTimeSlot } from '../../domain/entities/blocked-time-slot'
import type { DoctorAvailability } from '../../domain/entities/doctor-availability'

export interface AvailabilityMutationInput {
  weekday: number
  startTime: string
  endTime: string
  isActive: boolean
}

export interface AvailabilityUpdateInput {
  id: string
  weekday?: number
  startTime?: string
  endTime?: string
  isActive?: boolean
}

export interface BlockedSlotMutationInput {
  startsAt: string
  endsAt: string
  reason?: string | null
}

export interface BlockedSlotBulkMutationInput {
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  reason?: string | null
}

export interface AvailabilityBulkMutationInput {
  weekdays: number[]
  startTime: string
  endTime: string
  isActive: boolean
}

export type AvailabilityListResult = DoctorAvailability[]
export type BlockedSlotListResult = BlockedTimeSlot[]
