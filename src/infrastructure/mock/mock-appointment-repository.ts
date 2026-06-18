import type { Appointment } from '../../domain/entities/appointment'
import type { AppointmentRepository } from '../../domain/repositories/appointment-repository'
import { activeAppointmentStatuses } from '../../domain/value-objects/appointment-status'

export class MockAppointmentRepository implements AppointmentRepository {
  constructor(private readonly appointments: Appointment[]) {}

  async findById(appointmentId: string): Promise<Appointment | null> {
    return this.appointments.find((appointment) => appointment.id === appointmentId) ?? null
  }

  async listByDay(organizationId: string, day: Date): Promise<Appointment[]> {
    const start = new Date(day)
    start.setHours(0, 0, 0, 0)
    const end = new Date(day)
    end.setHours(23, 59, 59, 999)

    return this.appointments.filter(
      (appointment) =>
        appointment.organizationId === organizationId &&
        appointment.startAt >= start &&
        appointment.startAt <= end,
    )
  }

  async listCollisions(
    organizationId: string,
    startAt: Date,
    endAt: Date,
    ignoredAppointmentId?: string,
  ): Promise<Appointment[]> {
    return this.appointments.filter(
      (appointment) =>
        appointment.organizationId === organizationId &&
        appointment.id !== ignoredAppointmentId &&
        activeAppointmentStatuses.includes(appointment.status) &&
        appointment.startAt < endAt &&
        appointment.endAt > startAt,
    )
  }

  async listByRange(organizationId: string, start: Date, end: Date): Promise<Appointment[]> {
    return this.appointments.filter(
      (appointment) =>
        appointment.organizationId === organizationId &&
        appointment.startAt >= start &&
        appointment.startAt < end,
    )
  }

  async save(appointment: Appointment): Promise<Appointment> {
    const index = this.appointments.findIndex((item) => item.id === appointment.id)

    if (index >= 0) {
      this.appointments[index] = appointment
    } else {
      this.appointments.push(appointment)
    }

    return appointment
  }
}
