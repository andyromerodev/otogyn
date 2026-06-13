import type { Patient } from '../entities/patient'

export interface PatientRepository {
  listByOrganization(organizationId: string): Promise<Patient[]>
  findById(id: string): Promise<Patient | null>
}
