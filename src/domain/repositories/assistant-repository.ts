import type { Assistant } from '../entities/assistant'

export interface SaveAssistantInput {
  userId: string
  organizationId: string
  role: 'assistant'
  phone?: string | null
  specialty?: string | null
}

export interface AssistantRepository {
  listByOrganization(organizationId: string): Promise<Assistant[]>
  saveAssistant(input: SaveAssistantInput): Promise<Assistant>
}
