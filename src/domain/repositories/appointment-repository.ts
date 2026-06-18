import type { Appointment } from '../entities/appointment'

export interface AppointmentRepository {
  findById(appointmentId: string): Promise<Appointment | null>
  listByDay(organizationId: string, day: Date): Promise<Appointment[]>
  listByRange(organizationId: string, start: Date, end: Date): Promise<Appointment[]>
  listCollisions(
    organizationId: string,
    startAt: Date,
    endAt: Date,
    ignoredAppointmentId?: string,
  ): Promise<Appointment[]>
  save(appointment: Appointment): Promise<Appointment>
  saveWithLock(appointment: Appointment): Promise<Appointment>
}
