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
  create(patient: Patient): Promise<Patient>
  update(patient: Patient): Promise<Patient>
}
