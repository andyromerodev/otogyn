export interface Assistant {
  id: string
  userId: string
  organizationId: string
  name: string
  email: string
  role: 'admin_doctor' | 'assistant'
  phone: string | null
  specialty: string | null
  isActive: boolean
  deactivatedAt: Date | null
  createdAt: Date
  updatedAt: Date
}
