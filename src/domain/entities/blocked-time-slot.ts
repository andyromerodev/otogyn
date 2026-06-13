export interface BlockedTimeSlot {
  id: string
  organizationId: string
  startsAt: Date
  endsAt: Date
  reason: string | null
}
