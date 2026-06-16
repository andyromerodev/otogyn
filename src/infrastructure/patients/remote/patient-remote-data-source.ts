import type {
  PatientDetailInput,
  PatientMutationInput,
  UpdatePatientDetailInput,
} from '../../../application/dto/patient-management'
import type { Patient } from '../../../domain/entities/patient'

export interface PatientRemoteDataSource {
  listPatients(): Promise<Patient[]>
  getPatientDetail(input: PatientDetailInput): Promise<Patient>
  createPatient(input: PatientMutationInput): Promise<Patient>
  updatePatient(input: UpdatePatientDetailInput): Promise<Patient>
}
