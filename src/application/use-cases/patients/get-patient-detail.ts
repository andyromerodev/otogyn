import type { Patient } from '../../../domain/entities/patient'
import type { PatientDetailInput } from '../../dto/patient-management'
import type { PatientManagementRepository } from '../../ports/patient-management-repository'

export class GetPatientDetailUseCase {
  constructor(private readonly patientRepository: PatientManagementRepository) {}

  execute(input: PatientDetailInput): Promise<Patient> {
    return this.patientRepository.getPatientDetail(input)
  }
}
