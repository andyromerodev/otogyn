import type {
  PatientDetailInput,
  ListPatientsInput,
  PatientListResult,
  PatientMutationInput,
  UpdatePatientDetailInput,
} from '../../../application/dto/patient-management'
import type { Patient } from '../../../domain/entities/patient'
import type { PatientRemoteDataSource } from './patient-remote-data-source'

export class HttpPatientRemoteDataSource implements PatientRemoteDataSource {
  async listPatients(input: ListPatientsInput): Promise<PatientListResult> {
    if (import.meta.server) {
      const requestFetch = useRequestFetch() as (request: string, options?: Record<string, unknown>) => Promise<unknown>

      return await requestFetch('/api/patients', {
        query: {
          search: input.search?.trim() || undefined,
          filter: input.filter ?? 'all',
          page: input.page ?? 1,
          pageSize: input.pageSize ?? 10,
        },
      }) as PatientListResult
    }

    return $fetch<PatientListResult>('/api/patients', {
      query: {
        search: input.search?.trim() || undefined,
        filter: input.filter ?? 'all',
        page: input.page ?? 1,
        pageSize: input.pageSize ?? 10,
      },
    })
  }

  async getPatientDetail(input: PatientDetailInput): Promise<Patient> {
    if (import.meta.server) {
      const requestFetch = useRequestFetch() as (request: string, options?: Record<string, unknown>) => Promise<unknown>
      return await requestFetch(`/api/patients/${input.patientId}`) as Patient
    }

    return $fetch<Patient>(`/api/patients/${input.patientId}`)
  }

  async createPatient(input: PatientMutationInput): Promise<Patient> {
    if (import.meta.server) {
      const requestFetch = useRequestFetch() as (request: string, options?: Record<string, unknown>) => Promise<unknown>

      return await requestFetch('/api/patients', {
        method: 'POST',
        body: input,
      }) as Patient
    }

    return $fetch<Patient>('/api/patients', {
      method: 'POST',
      body: input,
    })
  }

  async updatePatient(input: UpdatePatientDetailInput): Promise<Patient> {
    const body = {
      fullName: input.fullName,
      phone: input.phone,
      email: input.email ?? null,
      birthDate: input.birthDate ?? null,
      documentId: input.documentId ?? null,
      administrativeNotes: input.administrativeNotes ?? null,
      isUrgent: input.isUrgent ?? false,
    }

    if (import.meta.server) {
      const requestFetch = useRequestFetch() as (request: string, options?: Record<string, unknown>) => Promise<unknown>

      return await requestFetch(`/api/patients/${input.patientId}`, {
        method: 'PATCH',
        body,
      }) as Patient
    }

    return $fetch<Patient>(`/api/patients/${input.patientId}`, {
      method: 'PATCH',
      body,
    })
  }
}
