import type { MedicalService } from '../../domain/entities/medical-service'

export interface ServiceMutationInput {
  name: string
  description?: string | null
  defaultDurationMinutes: number
  price?: number | null
  isActive?: boolean
}

export interface ServiceUpdateInput {
  id: string
  name?: string
  description?: string | null
  defaultDurationMinutes?: number
  price?: number | null
  isActive?: boolean
}

export interface ServiceScreenContextDto {
  userId: string
  organizationId: string
  role: 'admin_doctor' | 'assistant'
  email?: string
  name?: string
}

export type ServiceListResult = MedicalService[]
