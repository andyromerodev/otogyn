import type { Patient } from '../../../domain/entities/patient'
import type { UpdatePatientDetailInput } from '../../dto/patient-management'
import type { PatientManagementRepository } from '../../ports/patient-management-repository'

export class UpdatePatientUseCase {
  constructor(private readonly patientRepository: PatientManagementRepository) {}

  execute(input: UpdatePatientDetailInput): Promise<Patient> {
    return this.patientRepository.updatePatient({
      patientId: input.patientId,
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      email: input.email ?? null,
      birthDate: input.birthDate ?? null,
      documentId: input.documentId ?? null,
      administrativeNotes: input.administrativeNotes ?? null,
    })
  }
}
