import { and, asc, eq, gt, gte, inArray, lt, ne } from 'drizzle-orm'
import type { Appointment } from '../../domain/entities/appointment'
import type { AppointmentRepository } from '../../domain/repositories/appointment-repository'
import { activeAppointmentStatuses } from '../../domain/value-objects/appointment-status'
import { getDrizzleClient } from '../database/drizzle/client'
import { appointments } from '../database/schema'

const mapAppointment = (row: typeof appointments.$inferSelect): Appointment => ({
  id: row.id,
  organizationId: row.organizationId,
  patientId: row.patientId,
  serviceId: row.serviceId,
  professionalId: row.professionalId,
  startAt: row.startAt,
  endAt: row.endAt,
  status: row.status,
  isUrgent: row.isUrgent,
  reason: row.reason,
  notes: row.notes,
  createdBy: row.createdBy,
  updatedBy: row.updatedBy,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  cancelledAt: row.cancelledAt,
})

export class DrizzleAppointmentRepository implements AppointmentRepository {
  private readonly db = getDrizzleClient()

  async findById(appointmentId: string): Promise<Appointment | null> {
    const rows = await this.db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1)

    return rows[0] ? mapAppointment(rows[0]) : null
  }

  async listByDay(organizationId: string, day: Date): Promise<Appointment[]> {
    const start = new Date(day)
    start.setHours(0, 0, 0, 0)

    const end = new Date(day)
    end.setHours(23, 59, 59, 999)

    const rows = await this.db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.organizationId, organizationId),
          gte(appointments.startAt, start),
          lt(appointments.startAt, end),
        ),
      )
      .orderBy(asc(appointments.startAt))

    return rows.map(mapAppointment)
  }

  async listByRange(organizationId: string, start: Date, end: Date): Promise<Appointment[]> {
    const rows = await this.db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.organizationId, organizationId),
          gte(appointments.startAt, start),
          lt(appointments.startAt, end),
        ),
      )
      .orderBy(asc(appointments.startAt))

    return rows.map(mapAppointment)
  }

  async listCollisions(
    organizationId: string,
    startAt: Date,
    endAt: Date,
    ignoredAppointmentId?: string,
  ): Promise<Appointment[]> {
    const conditions = [
      eq(appointments.organizationId, organizationId),
      inArray(appointments.status, activeAppointmentStatuses),
      lt(appointments.startAt, endAt),
      gt(appointments.endAt, startAt),
    ]

    if (ignoredAppointmentId) {
      conditions.push(ne(appointments.id, ignoredAppointmentId))
    }

    const rows = await this.db
      .select()
      .from(appointments)
      .where(and(...conditions))
      .orderBy(asc(appointments.startAt))

    return rows.map(mapAppointment)
  }

  async save(appointment: Appointment): Promise<Appointment> {
    const existing = await this.db
      .select({ id: appointments.id })
      .from(appointments)
      .where(eq(appointments.id, appointment.id))
      .limit(1)

    if (!existing[0]) {
      const rows = await this.db
        .insert(appointments)
        .values({
          id: appointment.id,
          organizationId: appointment.organizationId,
          patientId: appointment.patientId,
          serviceId: appointment.serviceId,
          professionalId: appointment.professionalId,
          startAt: appointment.startAt,
          endAt: appointment.endAt,
          status: appointment.status,
          isUrgent: appointment.isUrgent,
          reason: appointment.reason,
          notes: appointment.notes,
          createdBy: appointment.createdBy,
          updatedBy: appointment.updatedBy,
          createdAt: appointment.createdAt,
          updatedAt: appointment.updatedAt,
          cancelledAt: appointment.cancelledAt,
        })
        .returning()

      return mapAppointment(rows[0]!)
    }

    const rows = await this.db
      .update(appointments)
      .set({
        patientId: appointment.patientId,
        serviceId: appointment.serviceId,
        professionalId: appointment.professionalId,
        startAt: appointment.startAt,
        endAt: appointment.endAt,
        status: appointment.status,
        isUrgent: appointment.isUrgent,
        reason: appointment.reason,
        notes: appointment.notes,
        updatedBy: appointment.updatedBy,
        updatedAt: appointment.updatedAt,
        cancelledAt: appointment.cancelledAt,
      })
      .where(eq(appointments.id, appointment.id))
      .returning()

    return mapAppointment(rows[0]!)
  }
}
