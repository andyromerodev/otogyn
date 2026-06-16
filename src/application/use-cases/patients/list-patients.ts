import type { Patient } from '../../../domain/entities/patient'
import type { PatientManagementRepository } from '../../ports/patient-management-repository'

export class ListPatientsUseCase {
  constructor(private readonly patientRepository: PatientManagementRepository) {}

  execute(): Promise<Patient[]> {
    return this.patientRepository.listPatients()
  }
}
