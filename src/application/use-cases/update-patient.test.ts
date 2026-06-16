import { describe, expect, it } from 'vitest'
import { UpdatePatientUseCase } from './update-patient'
import { MockPatientRepository } from '../../infrastructure/mock/mock-patient-repository'

describe('UpdatePatientUseCase', () => {
  it('updates a patient inside the same organization', async () => {
    const repository = new MockPatientRepository([
      {
        id: 'patient_1',
        organizationId: 'org_otogyn_demo',
        fullName: 'Ana Torres',
        phone: '999888777',
        email: 'ana@example.test',
        birthDate: null,
        documentId: null,
        administrativeNotes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ])

    const useCase = new UpdatePatientUseCase(repository)

    const patient = await useCase.execute({
      patientId: 'patient_1',
      organizationId: 'org_otogyn_demo',
      fullName: 'Ana Torres Ruiz',
      phone: '111222333',
      email: 'ana.ruiz@example.test',
      administrativeNotes: 'Seguimiento administrativo',
    })

    expect(patient.fullName).toBe('Ana Torres Ruiz')
    expect(patient.phone).toBe('111222333')
    expect(patient.email).toBe('ana.ruiz@example.test')
    expect(patient.administrativeNotes).toBe('Seguimiento administrativo')
  })
})
