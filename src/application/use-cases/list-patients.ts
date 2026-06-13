import type { Patient } from '../../domain/entities/patient'
import type { PatientRepository } from '../../domain/repositories/patient-repository'

export class ListPatientsUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  execute(input: { organizationId: string }): Promise<Patient[]> {
    return this.patientRepository.listByOrganization(input.organizationId)
  }
}
