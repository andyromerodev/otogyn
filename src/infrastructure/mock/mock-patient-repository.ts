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

  async update(patient: Patient): Promise<Patient> {
    const index = this.patients.findIndex((item) => item.id === patient.id)

    if (index === -1) {
      throw new Error('Patient not found in mock repository.')
    }

    this.patients[index] = patient
    return patient
  }
}
