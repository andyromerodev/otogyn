import type { MedicalService } from '../entities/medical-service'

export interface UpdateServiceInput {
  id: string
  name?: string
  description?: string | null
  defaultDurationMinutes?: number
  price?: number | null
  isActive?: boolean
}

export interface ServiceListPublicPageQuery {
  organizationId: string
  search?: string
  page: number
  pageSize: number
}

export interface ServiceListPublicPageResult {
  items: MedicalService[]
  total: number
}

export interface ServiceRepository {
  listByOrganization(organizationId: string, search?: string): Promise<MedicalService[]>
  listPublicServicesPaged(query: ServiceListPublicPageQuery): Promise<ServiceListPublicPageResult>
  findById(id: string): Promise<MedicalService | null>
  create(service: MedicalService): Promise<MedicalService>
  update(input: UpdateServiceInput): Promise<MedicalService>
  delete(id: string): Promise<void>
}
