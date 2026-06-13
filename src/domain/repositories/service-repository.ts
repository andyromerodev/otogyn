import type { MedicalService } from '../entities/medical-service'

export interface ServiceRepository {
  listByOrganization(organizationId: string): Promise<MedicalService[]>
  findById(id: string): Promise<MedicalService | null>
}
