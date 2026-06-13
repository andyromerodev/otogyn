export interface DoctorAvailability {
  id: string
  organizationId: string
  weekday: number
  startTime: string
  endTime: string
  isActive: boolean
}
