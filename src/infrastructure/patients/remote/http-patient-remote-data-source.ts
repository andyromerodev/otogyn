import type {
  PatientDetailInput,
  PatientMutationInput,
  UpdatePatientDetailInput,
} from '../../../application/dto/patient-management'
import type { Patient } from '../../../domain/entities/patient'
import type { PatientRemoteDataSource } from './patient-remote-data-source'

export class HttpPatientRemoteDataSource implements PatientRemoteDataSource {
  async listPatients(): Promise<Patient[]> {
    return $fetch<Patient[]>('/api/patients')
  }

  async getPatientDetail(input: PatientDetailInput): Promise<Patient> {
    return $fetch<Patient>(`/api/patients/${input.patientId}`)
  }

  async createPatient(input: PatientMutationInput): Promise<Patient> {
    return $fetch<Patient>('/api/patients', {
      method: 'POST',
      body: input,
    })
  }

  async updatePatient(input: UpdatePatientDetailInput): Promise<Patient> {
    return $fetch<Patient>(`/api/patients/${input.patientId}`, {
      method: 'PATCH',
      body: {
        fullName: input.fullName,
        phone: input.phone,
        email: input.email ?? null,
        birthDate: input.birthDate ?? null,
        documentId: input.documentId ?? null,
        administrativeNotes: input.administrativeNotes ?? null,
      },
    })
  }
}
