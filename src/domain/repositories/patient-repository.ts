import type { Patient } from '../entities/patient'

export type PatientListFilter = 'all' | 'today' | 'urgent' | 'follow_up'

export interface PatientListPageQuery {
  organizationId: string
  search: string
  filter: PatientListFilter
  page: number
  pageSize: number
}

export interface PatientListItem extends Patient {
  hasUrgentAppointment: boolean
}

export interface PatientListPageResult {
  items: PatientListItem[]
  total: number
  allTotal: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PatientRepository {
  listByOrganization(organizationId: string): Promise<Patient[]>
  listPage(input: PatientListPageQuery): Promise<PatientListPageResult>
  findById(id: string): Promise<Patient | null>
  /**
   * Exact match only, scoped to the organization and excluding soft-deleted
   * patients. `phone` is always required to match exactly. When `email` is
   * provided, it must ALSO match exactly (AND, not OR) — this keeps matching
   * tight enough to be safe for silent, unauthenticated linking (e.g. from a
   * public form) without risking false positives from shared phone numbers.
   */
  findByExactPhoneAndEmail(
    organizationId: string,
    phone: string,
    email: string | null,
  ): Promise<Patient | null>
  create(patient: Patient): Promise<Patient>
  update(patient: Patient): Promise<Patient>
}
