import type { Appointment } from '../entities/appointment'

export interface AppointmentRepository {
  listByDay(organizationId: string, day: Date): Promise<Appointment[]>
  listCollisions(
    organizationId: string,
    startAt: Date,
    endAt: Date,
    ignoredAppointmentId?: string,
  ): Promise<Appointment[]>
  save(appointment: Appointment): Promise<Appointment>
}
