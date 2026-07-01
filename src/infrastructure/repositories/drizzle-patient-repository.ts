import { and, asc, count, eq, gte, ilike, inArray, isNull, lt, or } from 'drizzle-orm'
import { BusinessRuleError } from '../../domain/errors/business-rule-error'
import type { Patient } from '../../domain/entities/patient'
import type { PatientListItem, PatientListPageQuery, PatientListPageResult, PatientRepository } from '../../domain/repositories/patient-repository'
import { activeAppointmentStatuses } from '../../domain/value-objects/appointment-status'
import type { DrizzleClient } from '../database/drizzle/client'
import { getDrizzleClient } from '../database/drizzle/client'
import { appointments, patients } from '../database/schema'

const mapPatient = (row: typeof patients.$inferSelect): Patient => ({
  id: row.id,
  organizationId: row.organizationId,
  fullName: row.fullName,
  phone: row.phone,
  email: row.email,
  birthDate: row.birthDate ? row.birthDate.toISOString().slice(0, 10) : null,
  documentId: row.documentId,
  administrativeNotes: row.administrativeNotes,
  isUrgent: row.isUrgent,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  deletedAt: row.deletedAt,
})

const toBirthDate = (birthDate: string | null) => {
  if (!birthDate) {
    return null
  }

  return new Date(`${birthDate}T00:00:00.000Z`)
}

export class DrizzlePatientRepository implements PatientRepository {
  constructor(private readonly db: DrizzleClient = getDrizzleClient()) {}

  async listByOrganization(organizationId: string): Promise<Patient[]> {
    const rows = await this.db
      .select()
      .from(patients)
      .where(and(eq(patients.organizationId, organizationId), isNull(patients.deletedAt)))
      .orderBy(asc(patients.fullName))

    return rows.map(mapPatient)
  }

  async listPage(input: PatientListPageQuery): Promise<PatientListPageResult> {
    const pageSize = Math.min(Math.max(input.pageSize, 1), 50)
    const allTotal = await this.countAllPatients(input.organizationId)
    const todayPatientIds = input.filter === 'today'
      ? await this.resolveTodayPatientIds(input.organizationId)
      : null
    const urgentAppointmentPatientIds = await this.resolveUrgentAppointmentPatientIds(input.organizationId)

    if (input.filter === 'today' && todayPatientIds && todayPatientIds.length === 0) {
      return {
        items: [],
        total: 0,
        allTotal,
        page: 1,
        pageSize,
        totalPages: 1,
      }
    }

    const conditions = [
      eq(patients.organizationId, input.organizationId),
      isNull(patients.deletedAt),
    ]

    const trimmedSearch = input.search.trim()

    if (trimmedSearch) {
      const searchLike = `%${trimmedSearch}%`
      conditions.push(
        or(
          ilike(patients.fullName, searchLike),
          ilike(patients.administrativeNotes, searchLike),
        )!,
      )
    }

    if (input.filter === 'follow_up') {
      conditions.push(ilike(patients.administrativeNotes, '%seguimiento%'))
    }

    if (input.filter === 'today' && todayPatientIds) {
      conditions.push(inArray(patients.id, todayPatientIds))
    }

    if (input.filter === 'urgent') {
      conditions.push(
        urgentAppointmentPatientIds.length > 0
          ? or(eq(patients.isUrgent, true), inArray(patients.id, urgentAppointmentPatientIds))!
          : eq(patients.isUrgent, true),
      )
    }

    const [{ value: total = 0 } = { value: 0 }] = await this.db
      .select({ value: count() })
      .from(patients)
      .where(and(...conditions))

    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const page = Math.min(Math.max(input.page, 1), totalPages)
    const offset = (page - 1) * pageSize

    const rows = await this.db
      .select()
      .from(patients)
      .where(and(...conditions))
      .orderBy(asc(patients.fullName))
      .limit(pageSize)
      .offset(offset)

    const urgentPatientIds = new Set(urgentAppointmentPatientIds)

    return {
      items: rows.map((row): PatientListItem => ({
        ...mapPatient(row),
        hasUrgentAppointment: urgentPatientIds.has(row.id),
      })),
      total,
      allTotal,
      page,
      pageSize,
      totalPages,
    }
  }

  async findById(id: string): Promise<Patient | null> {
    const row = await this.db
      .select()
      .from(patients)
      .where(and(eq(patients.id, id), isNull(patients.deletedAt)))
      .limit(1)

    return row[0] ? mapPatient(row[0]) : null
  }

  async create(patient: Patient): Promise<Patient> {
    const row = await this.db
      .insert(patients)
      .values({
        id: patient.id,
        organizationId: patient.organizationId,
        fullName: patient.fullName,
        phone: patient.phone,
        email: patient.email,
        birthDate: toBirthDate(patient.birthDate),
        documentId: patient.documentId,
        administrativeNotes: patient.administrativeNotes,
        isUrgent: patient.isUrgent,
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt,
        deletedAt: patient.deletedAt,
      })
      .returning()

    return mapPatient(row[0]!)
  }

  async update(patient: Patient): Promise<Patient> {
    const row = await this.db
      .update(patients)
      .set({
        fullName: patient.fullName,
        phone: patient.phone,
        email: patient.email,
        birthDate: toBirthDate(patient.birthDate),
        documentId: patient.documentId,
        administrativeNotes: patient.administrativeNotes,
        isUrgent: patient.isUrgent,
        updatedAt: patient.updatedAt,
      })
      .where(and(eq(patients.id, patient.id), isNull(patients.deletedAt)))
      .returning()

    if (!row[0]) {
      throw new BusinessRuleError('Patient not found.')
    }

    return mapPatient(row[0])
  }

  private async countAllPatients(organizationId: string): Promise<number> {
    const [{ value: total = 0 } = { value: 0 }] = await this.db
      .select({ value: count() })
      .from(patients)
      .where(and(eq(patients.organizationId, organizationId), isNull(patients.deletedAt)))

    return total
  }

  private async resolveTodayPatientIds(organizationId: string): Promise<string[]> {
    const start = new Date()
    start.setHours(0, 0, 0, 0)

    const end = new Date(start)
    end.setDate(end.getDate() + 1)

    const rows = await this.db
      .selectDistinct({ patientId: appointments.patientId })
      .from(appointments)
      .where(
        and(
          eq(appointments.organizationId, organizationId),
          gte(appointments.startAt, start),
          lt(appointments.startAt, end),
        ),
      )

    return rows.map((row) => row.patientId)
  }

  private async resolveUrgentAppointmentPatientIds(organizationId: string): Promise<string[]> {
    const rows = await this.db
      .selectDistinct({ patientId: appointments.patientId })
      .from(appointments)
      .where(
        and(
          eq(appointments.organizationId, organizationId),
          eq(appointments.isUrgent, true),
          inArray(appointments.status, activeAppointmentStatuses),
        ),
      )

    return rows.map((row) => row.patientId)
  }
}
