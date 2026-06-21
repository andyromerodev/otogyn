import type { ListPatientsInput, PatientListResult } from '../../dto/patient-management'
import type { PatientManagementRepository } from '../../ports/patient-management-repository'

export class ListPatientsUseCase {
  constructor(private readonly patientRepository: PatientManagementRepository) {}

  execute(input: ListPatientsInput): Promise<PatientListResult> {
    return this.patientRepository.listPatients(input)
  }
}
