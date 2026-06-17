import type { Assistant } from '../entities/assistant'

export interface SaveAssistantInput {
  userId: string
  organizationId: string
  role: 'assistant'
  name?: string
  phone?: string | null
  specialty?: string | null
}

export interface UpdateAssistantInput {
  userId: string
  organizationId: string
  name: string
  phone?: string | null
  specialty?: string | null
}

export interface AssistantRepository {
  listByOrganization(organizationId: string): Promise<Assistant[]>
  saveAssistant(input: SaveAssistantInput): Promise<Assistant>
  updateAssistant(input: UpdateAssistantInput): Promise<Assistant>
  deactivateAssistant(organizationId: string, userId: string): Promise<Assistant>
  reactivateAssistant(organizationId: string, userId: string): Promise<Assistant>
  deleteAssistant(organizationId: string, userId: string): Promise<void>
}
