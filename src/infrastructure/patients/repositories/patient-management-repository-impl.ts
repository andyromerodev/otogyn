import type {
  PatientDetailInput,
  PatientMutationInput,
  UpdatePatientDetailInput,
} from '../../../application/dto/patient-management'
import type { PatientManagementRepository } from '../../../application/ports/patient-management-repository'
import type { Patient } from '../../../domain/entities/patient'
import type { PatientRemoteDataSource } from '../remote/patient-remote-data-source'

export class PatientManagementRepositoryImpl implements PatientManagementRepository {
  constructor(private readonly remoteDataSource: PatientRemoteDataSource) {}

  listPatients(): Promise<Patient[]> {
    return this.remoteDataSource.listPatients()
  }

  getPatientDetail(input: PatientDetailInput): Promise<Patient> {
    return this.remoteDataSource.getPatientDetail(input)
  }

  createPatient(input: PatientMutationInput): Promise<Patient> {
    return this.remoteDataSource.createPatient(input)
  }

  updatePatient(input: UpdatePatientDetailInput): Promise<Patient> {
    return this.remoteDataSource.updatePatient(input)
  }
}
