import { BusinessRuleError } from '../../domain/errors/business-rule-error'
import type { Patient } from '../../domain/entities/patient'
import type { PatientRepository } from '../../domain/repositories/patient-repository'

export interface UpdatePatientInput {
  patientId: string
  organizationId: string
  fullName: string
  phone: string
  email?: string | null
  birthDate?: string | null
  documentId?: string | null
  administrativeNotes?: string | null
  isUrgent?: boolean
}

export class UpdatePatientUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute(input: UpdatePatientInput): Promise<Patient> {
    const existingPatient = await this.patientRepository.findById(input.patientId)

    if (!existingPatient || existingPatient.organizationId !== input.organizationId) {
      throw new BusinessRuleError('Patient not found.')
    }

    return this.patientRepository.update({
      ...existingPatient,
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      email: input.email ?? null,
      birthDate: input.birthDate ?? null,
      documentId: input.documentId ?? null,
      administrativeNotes: input.administrativeNotes ?? null,
      isUrgent: input.isUrgent ?? false,
      updatedAt: new Date(),
    })
  }
}
