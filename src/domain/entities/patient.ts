export interface Patient {
  id: string
  organizationId: string
  fullName: string
  phone: string
  email: string | null
  birthDate: string | null
  documentId: string | null
  administrativeNotes: string | null
  isUrgent: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}
