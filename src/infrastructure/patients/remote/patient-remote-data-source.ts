import type {
  PatientDetailInput,
  ListPatientsInput,
  PatientListResult,
  PatientMutationInput,
  UpdatePatientDetailInput,
} from '../../../application/dto/patient-management'
import type { Patient } from '../../../domain/entities/patient'

export interface PatientRemoteDataSource {
  listPatients(input: ListPatientsInput): Promise<PatientListResult>
  getPatientDetail(input: PatientDetailInput): Promise<Patient>
  createPatient(input: PatientMutationInput): Promise<Patient>
  updatePatient(input: UpdatePatientDetailInput): Promise<Patient>
}
