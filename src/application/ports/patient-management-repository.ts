import type {
  PatientDetailInput,
  ListPatientsInput,
  PatientListResult,
  PatientMutationInput,
  UpdatePatientDetailInput,
} from '../dto/patient-management'
import type { Patient } from '../../domain/entities/patient'

export interface PatientManagementRepository {
  listPatients(input: ListPatientsInput): Promise<PatientListResult>
  getPatientDetail(input: PatientDetailInput): Promise<Patient>
  createPatient(input: PatientMutationInput): Promise<Patient>
  updatePatient(input: UpdatePatientDetailInput): Promise<Patient>
}
