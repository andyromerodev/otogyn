import type { TreatmentTemplate, CreateTreatmentTemplateInput } from '../dto/consultation'

export interface TreatmentTemplateRepository {
  list(organizationId: string, diagnosisCode?: string): Promise<TreatmentTemplate[]>
  create(input: CreateTreatmentTemplateInput): Promise<TreatmentTemplate>
  // Devuelve true si se eliminó, false si no existía (cross-org guard).
  delete(id: string, organizationId: string): Promise<boolean>
}
