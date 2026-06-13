export interface MedicalService {
  id: string
  organizationId: string
  name: string
  description: string | null
  defaultDurationMinutes: number
  price: number | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
