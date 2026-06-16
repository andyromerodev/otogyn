import type { Assistant } from '../../domain/entities/assistant'

export interface AssistantMutationInput {
  name: string
  email: string
  password: string
  phone?: string | null
  specialty?: string | null
}

export interface AssistantScreenContextDto {
  userId: string
  organizationId: string
  role: 'admin_doctor' | 'assistant'
  email?: string
  name?: string
}

export type AssistantListResult = Assistant[]
