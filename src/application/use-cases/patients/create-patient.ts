import type { Patient } from '../../../domain/entities/patient'
import type { PatientMutationInput } from '../../dto/patient-management'
import type { PatientManagementRepository } from '../../ports/patient-management-repository'

export class CreatePatientUseCase {
  constructor(private readonly patientRepository: PatientManagementRepository) {}

  execute(input: PatientMutationInput): Promise<Patient> {
    return this.patientRepository.createPatient({
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      email: input.email ?? null,
      birthDate: input.birthDate ?? null,
      documentId: input.documentId ?? null,
      administrativeNotes: input.administrativeNotes ?? null,
    })
  }
}
