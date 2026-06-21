import type { Patient } from '../../domain/entities/patient'
import type { PatientListItem, PatientListPageQuery, PatientListPageResult, PatientRepository } from '../../domain/repositories/patient-repository'

export class MockPatientRepository implements PatientRepository {
  constructor(private readonly patients: Patient[]) {}

  async listByOrganization(organizationId: string): Promise<Patient[]> {
    return this.patients.filter((patient) => patient.organizationId === organizationId && !patient.deletedAt)
  }

  async listPage(input: PatientListPageQuery): Promise<PatientListPageResult> {
    const base = this.patients
      .filter((patient) => patient.organizationId === input.organizationId && !patient.deletedAt)
      .sort((left, right) => left.fullName.localeCompare(right.fullName))

    const filtered = base.filter((patient) => {
      const matchesSearch = input.search
        ? `${patient.fullName} ${patient.administrativeNotes ?? ''}`.toLowerCase().includes(input.search.toLowerCase())
        : true

      if (input.filter === 'follow_up') {
        return matchesSearch && (patient.administrativeNotes?.toLowerCase().includes('seguimiento') ?? false)
      }

      if (input.filter === 'urgent') {
        return matchesSearch && patient.isUrgent
      }

      return matchesSearch
    })

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / input.pageSize))
    const page = Math.min(Math.max(input.page, 1), totalPages)
    const start = (page - 1) * input.pageSize

    const items: PatientListItem[] = filtered
      .slice(start, start + input.pageSize)
      .map((patient) => ({ ...patient, hasUrgentAppointment: false }))

    return {
      items,
      total,
      allTotal: base.length,
      page,
      pageSize: input.pageSize,
      totalPages,
    }
  }

  async findById(id: string): Promise<Patient | null> {
    return this.patients.find((patient) => patient.id === id && !patient.deletedAt) ?? null
  }

  async create(patient: Patient): Promise<Patient> {
    this.patients.push(patient)
    return patient
  }

  async update(patient: Patient): Promise<Patient> {
    const index = this.patients.findIndex((item) => item.id === patient.id)

    if (index === -1) {
      throw new Error('Patient not found in mock repository.')
    }

    this.patients[index] = patient
    return patient
  }
}
