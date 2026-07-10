import { and, asc, count, desc, eq, gt, gte, ilike, inArray, lt, ne, or, sql } from 'drizzle-orm'
import type { Appointment } from '../../domain/entities/appointment'
import type { AppointmentStatsDto, AppointmentStatsRange } from '../../application/dto/appointment-stats'
import type {
  AppointmentListItem,
  AppointmentLinkedPayment,
  AppointmentListPageQuery,
  AppointmentListPageResult,
  AppointmentRepository,
} from '../../domain/repositories/appointment-repository'
import { BusinessRuleError } from '../../domain/errors/business-rule-error'
import { activeAppointmentStatuses } from '../../domain/value-objects/appointment-status'
import { APP_TIME_ZONE, getAppDayBounds } from '../../application/utils/date/local-date'
import type { DrizzleClient } from '../database/drizzle/client'
import { getDrizzleClient } from '../database/drizzle/client'
import { appointments, patients, payments, services } from '../database/schema'

const mapAppointment = (row: typeof appointments.$inferSelect): Appointment => ({
  id: row.id,
  organizationId: row.organizationId,
  patientId: row.patientId,
  serviceId: row.serviceId,
  agreedPrice: row.agreedPrice === null ? null : Number(row.agreedPrice),
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

const mapAppointmentListItem = (row: {
  appointment: typeof appointments.$inferSelect
  patientName: string | null
  serviceName: string | null
  linkedPaymentId: string | null
  linkedPaymentAmount: string | null
  linkedPaymentMethod: typeof payments.$inferSelect.method | null
  linkedPaymentPaidAt: Date | null
}): AppointmentListItem => ({
  ...mapAppointment(row.appointment),
  patientName: row.patientName ?? 'Paciente desconocido',
  serviceName: row.serviceName ?? 'Servicio desconocido',
  paymentStatus: row.linkedPaymentId ? 'paid' : 'pending',
  linkedPayment: row.linkedPaymentId
    ? {
        id: row.linkedPaymentId,
        amount: Number(row.linkedPaymentAmount ?? '0'),
        method: row.linkedPaymentMethod!,
        paidAt: row.linkedPaymentPaidAt!,
      } satisfies AppointmentLinkedPayment
    : null,
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

  async listPage(input: AppointmentListPageQuery): Promise<AppointmentListPageResult> {
    const pageSize = Math.min(Math.max(input.pageSize, 1), 50)
    const allTotalRows = await this.db
      .select({ value: count() })
      .from(appointments)
      .where(eq(appointments.organizationId, input.organizationId))

    const allTotal = allTotalRows[0]?.value ?? 0
    const conditions = [eq(appointments.organizationId, input.organizationId)]

    if (input.startAtFrom) {
      conditions.push(gte(appointments.startAt, input.startAtFrom))
    }

    if (input.startAtTo) {
      conditions.push(lt(appointments.startAt, input.startAtTo))
    }

    const trimmedSearch = input.search.trim()

    if (trimmedSearch) {
      const searchLike = `%${trimmedSearch}%`
      conditions.push(
        or(
          ilike(patients.fullName, searchLike),
          ilike(services.name, searchLike),
          ilike(appointments.reason, searchLike),
          ilike(appointments.notes, searchLike),
        )!,
      )
    }

    const filteredWhere = and(...conditions)
    const totalRows = await this.db
      .select({ value: count() })
      .from(appointments)
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .where(filteredWhere)

    const total = totalRows[0]?.value ?? 0
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const page = Math.min(Math.max(input.page, 1), totalPages)
    const offset = (page - 1) * pageSize

    const rows = await this.db
      .select({
        appointment: appointments,
        patientName: patients.fullName,
        serviceName: services.name,
        linkedPaymentId: payments.id,
        linkedPaymentAmount: payments.amount,
        linkedPaymentMethod: payments.method,
        linkedPaymentPaidAt: payments.paidAt,
      })
      .from(appointments)
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .leftJoin(
        payments,
        and(
          eq(payments.appointmentId, appointments.id),
          eq(payments.organizationId, appointments.organizationId),
        ),
      )
      .where(filteredWhere)
      .orderBy(desc(appointments.startAt))
      .limit(pageSize)
      .offset(offset)

    return {
      items: rows.map(mapAppointmentListItem),
      total,
      allTotal,
      page,
      pageSize,
      totalPages,
    }
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
                agreedPrice: appointment.agreedPrice === null ? null : appointment.agreedPrice.toFixed(2),
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
              agreedPrice: appointment.agreedPrice === null ? null : appointment.agreedPrice.toFixed(2),
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
          agreedPrice: appointment.agreedPrice === null ? null : appointment.agreedPrice.toFixed(2),
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
        agreedPrice: appointment.agreedPrice === null ? null : appointment.agreedPrice.toFixed(2),
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

  async getStats(input: { organizationId: string; range: AppointmentStatsRange }): Promise<AppointmentStatsDto> {
    const now = new Date()
    const rangeMs: Record<AppointmentStatsRange, number> = {
      week: 7 * 86_400_000,
      month: 30 * 86_400_000,
      year: 365 * 86_400_000,
    }
    const from = new Date(now.getTime() - rangeMs[input.range])
    const orgId = input.organizationId
    const tz = sql.raw(`'${APP_TIME_ZONE}'`)

    // Status counts in range
    const statusRows = await this.db
      .select({ status: appointments.status, cnt: count() })
      .from(appointments)
      .where(and(eq(appointments.organizationId, orgId), gte(appointments.startAt, from), lt(appointments.startAt, now)))
      .groupBy(appointments.status)

    const byStatus: Record<string, number> = {}
    let total = 0
    for (const row of statusRows) {
      byStatus[row.status] = Number(row.cnt)
      total += Number(row.cnt)
    }

    const completed = byStatus['completed'] ?? 0
    const cancelled = byStatus['cancelled'] ?? 0
    const no_show = byStatus['no_show'] ?? 0
    const scheduled = byStatus['scheduled'] ?? 0
    const confirmed = byStatus['confirmed'] ?? 0
    const cancellationRate = total > 0 ? Number(((cancelled / total) * 100).toFixed(1)) : 0

    // Urgent count
    const [urgentRow] = await this.db
      .select({ cnt: count() })
      .from(appointments)
      .where(and(eq(appointments.organizationId, orgId), gte(appointments.startAt, from), lt(appointments.startAt, now), eq(appointments.isUrgent, true)))

    const urgent = Number(urgentRow?.cnt ?? 0)

    // Average duration in minutes
    const [durationRow] = await this.db
      .select({
        avg: sql<string>`avg(extract(epoch from ${appointments.endAt} - ${appointments.startAt}) / 60)`,
      })
      .from(appointments)
      .where(and(eq(appointments.organizationId, orgId), gte(appointments.startAt, from), lt(appointments.startAt, now)))

    const avgDurationMinutes = durationRow?.avg ? Math.round(Number(durationRow.avg)) : null

    // Monthly series — always last 12 months
    const seriesFrom = new Date(now.getTime() - 365 * 86_400_000)
    const monthKey = sql<string>`to_char(date_trunc('month', timezone(${tz}, ${appointments.startAt})), 'YYYY-MM')`

    const seriesRows = await this.db
      .select({ monthKey, status: appointments.status, cnt: count() })
      .from(appointments)
      .where(and(eq(appointments.organizationId, orgId), gte(appointments.startAt, seriesFrom), lt(appointments.startAt, now)))
      .groupBy(sql.raw('1'), appointments.status)
      .orderBy(sql.raw('1'))

    const seriesMap = new Map<string, { completed: number; cancelled: number; no_show: number; total: number }>()
    for (const row of seriesRows) {
      const key = row.monthKey
      if (!seriesMap.has(key)) seriesMap.set(key, { completed: 0, cancelled: 0, no_show: 0, total: 0 })
      const entry = seriesMap.get(key)!
      const n = Number(row.cnt)
      if (row.status === 'completed') entry.completed += n
      else if (row.status === 'cancelled') entry.cancelled += n
      else if (row.status === 'no_show') entry.no_show += n
      entry.total += n
    }

    const shortMonthFmt = new Intl.DateTimeFormat('es-PE', { month: 'short', timeZone: APP_TIME_ZONE })
    const monthlySeries = Array.from(seriesMap.entries()).map(([key, vals]) => {
      const [year, month] = key.split('-').map(Number)
      const d = new Date(Date.UTC(year!, month! - 1, 1))
      const label = shortMonthFmt.format(d).replace('.', '')
      return { monthKey: key, monthShortLabel: label.charAt(0).toUpperCase() + label.slice(1), ...vals }
    })

    // By service (top 10)
    const serviceRows = await this.db
      .select({ serviceName: services.name, cnt: count() })
      .from(appointments)
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .where(and(eq(appointments.organizationId, orgId), gte(appointments.startAt, from), lt(appointments.startAt, now)))
      .groupBy(services.name)
      .orderBy(desc(count()))
      .limit(10)

    const byService = serviceRows.map((r) => ({ serviceName: r.serviceName, count: Number(r.cnt) }))

    // By weekday
    const weekdayKey = sql<string>`extract(dow from timezone(${tz}, ${appointments.startAt}))::int::text`
    const weekdayRows = await this.db
      .select({ weekday: weekdayKey, cnt: count() })
      .from(appointments)
      .where(and(eq(appointments.organizationId, orgId), gte(appointments.startAt, from), lt(appointments.startAt, now)))
      .groupBy(sql.raw('1'))
      .orderBy(sql.raw('1'))

    const weekdayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const byWeekday = weekdayRows.map((r) => {
      const wd = Number(r.weekday)
      return { weekday: wd, label: weekdayLabels[wd] ?? `${wd}`, count: Number(r.cnt) }
    })

    return {
      range: input.range,
      total,
      completed,
      cancelled,
      no_show,
      scheduled,
      confirmed,
      urgent,
      cancellationRate,
      avgDurationMinutes,
      monthlySeries,
      byService,
      byWeekday,
    }
  }
}
