import { describe, expect, it } from 'vitest'
import { CreatePatientUseCase } from './create-patient'
import { MockPatientRepository } from '../../infrastructure/mock/mock-patient-repository'

describe('CreatePatientUseCase', () => {
  it('creates a patient inside the organization context', async () => {
    const repository = new MockPatientRepository([])
    const useCase = new CreatePatientUseCase(repository)

    const patient = await useCase.execute({
      organizationId: 'org_otogyn_demo',
      fullName: 'Ana Torres',
      phone: '999888777',
      email: 'ana@example.test',
      birthDate: null,
      documentId: null,
      administrativeNotes: 'Paciente nueva',
    })

    expect(patient.organizationId).toBe('org_otogyn_demo')
    expect(patient.fullName).toBe('Ana Torres')
    expect(patient.phone).toBe('999888777')
    expect(patient.deletedAt).toBeNull()
  })
})
