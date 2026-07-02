import { and, asc, eq, gt, gte, inArray, lt, ne } from 'drizzle-orm'
import type { Appointment } from '../../domain/entities/appointment'
import type { AppointmentRepository } from '../../domain/repositories/appointment-repository'
import { BusinessRuleError } from '../../domain/errors/business-rule-error'
import { activeAppointmentStatuses } from '../../domain/value-objects/appointment-status'
import { getAppDayBounds } from '../../application/utils/date/local-date'
import type { DrizzleClient } from '../database/drizzle/client'
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
  constructor(private readonly db: DrizzleClient = getDrizzleClient()) {}

  async findById(appointmentId: string): Promise<Appointment | null> {
    const rows = await this.db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1)

    return rows[0] ? mapAppointment(rows[0]) : null
  }

  async listByDay(organizationId: string, day: Date): Promise<Appointment[]> {
    const { start, end } = getAppDayBounds(day)

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

  async saveWithLock(appointment: Appointment): Promise<Appointment> {
    try {
      return await this.db.transaction(
        async (tx) => {
          const collisionConditions = [
            eq(appointments.organizationId, appointment.organizationId),
            inArray(appointments.status, activeAppointmentStatuses),
            lt(appointments.startAt, appointment.endAt),
            gt(appointments.endAt, appointment.startAt),
          ]

          if (appointment.id) {
            collisionConditions.push(ne(appointments.id, appointment.id))
          }

          const collisions = await tx
            .select({ id: appointments.id })
            .from(appointments)
            .where(and(...collisionConditions))
            .limit(1)

          if (collisions.length > 0) {
            throw new BusinessRuleError('No puede existir una cita que choque con otra cita activa.')
          }

          const existing = await tx
            .select({ id: appointments.id })
            .from(appointments)
            .where(eq(appointments.id, appointment.id))
            .limit(1)

          if (!existing[0]) {
            const rows = await tx
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

          const rows = await tx
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
        },
        { isolationLevel: 'serializable' },
      )
    } catch (error) {
      if (error instanceof BusinessRuleError) throw error
      if (error instanceof Error && error.message.includes('could not serialize')) {
        throw new BusinessRuleError('No puede existir una cita que choque con otra cita activa.')
      }
      throw error
    }
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
