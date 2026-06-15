import { and, asc, eq, isNull } from 'drizzle-orm'
import type { Patient } from '../../domain/entities/patient'
import type { PatientRepository } from '../../domain/repositories/patient-repository'
import { getDrizzleClient } from '../database/drizzle/client'
import { patients } from '../database/schema'

const mapPatient = (row: typeof patients.$inferSelect): Patient => ({
  id: row.id,
  organizationId: row.organizationId,
  fullName: row.fullName,
  phone: row.phone,
  email: row.email,
  birthDate: row.birthDate ? row.birthDate.toISOString().slice(0, 10) : null,
  documentId: row.documentId,
  administrativeNotes: row.administrativeNotes,
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
  private readonly db = getDrizzleClient()

  async listByOrganization(organizationId: string): Promise<Patient[]> {
    const rows = await this.db
      .select()
      .from(patients)
      .where(and(eq(patients.organizationId, organizationId), isNull(patients.deletedAt)))
      .orderBy(asc(patients.fullName))

    return rows.map(mapPatient)
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
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt,
        deletedAt: patient.deletedAt,
      })
      .returning()

    return mapPatient(row[0]!)
  }
}
