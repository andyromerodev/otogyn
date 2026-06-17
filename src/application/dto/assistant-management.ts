import type { Assistant } from '../../domain/entities/assistant'

export interface AssistantMutationInput {
  name: string
  email: string
  password: string
  phone?: string | null
  specialty?: string | null
  reuseExistingUser?: boolean
}

export interface AssistantUpdateInput {
  userId: string
  name: string
  phone?: string | null
  specialty?: string | null
}

export interface AssistantActivationInput {
  userId: string
}

export type AssistantEmailStatus =
  | 'available'
  | 'assistant_active'
  | 'assistant_inactive'
  | 'orphan_reusable'
  | 'existing_unavailable'

export interface AssistantEmailCheckResult {
  status: AssistantEmailStatus
  userId?: string
  name?: string
  email: string
}

export interface AssistantScreenContextDto {
  userId: string
  organizationId: string
  role: 'admin_doctor' | 'assistant'
  email?: string
  name?: string
}

export type AssistantListResult = Assistant[]
