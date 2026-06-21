import type { Patient } from '../../domain/entities/patient'
import type { PatientRepository } from '../../domain/repositories/patient-repository'

export interface CreatePatientInput {
  organizationId: string
  fullName: string
  phone: string
  email?: string | null
  birthDate?: string | null
  documentId?: string | null
  administrativeNotes?: string | null
  isUrgent?: boolean
}

export class CreatePatientUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  execute(input: CreatePatientInput): Promise<Patient> {
    const now = new Date()

    return this.patientRepository.create({
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      email: input.email ?? null,
      birthDate: input.birthDate ?? null,
      documentId: input.documentId ?? null,
      administrativeNotes: input.administrativeNotes ?? null,
      isUrgent: input.isUrgent ?? false,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    })
  }
}
