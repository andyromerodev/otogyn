import type { Patient } from '../../domain/entities/patient'
import type { PatientRepository } from '../../domain/repositories/patient-repository'

export class MockPatientRepository implements PatientRepository {
  constructor(private readonly patients: Patient[]) {}

  async listByOrganization(organizationId: string): Promise<Patient[]> {
    return this.patients.filter((patient) => patient.organizationId === organizationId && !patient.deletedAt)
  }

  async findById(id: string): Promise<Patient | null> {
    return this.patients.find((patient) => patient.id === id && !patient.deletedAt) ?? null
  }

  async create(patient: Patient): Promise<Patient> {
    this.patients.push(patient)
    return patient
  }
}
