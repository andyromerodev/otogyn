import { describe, expect, it, vi } from 'vitest'
import { createPatientsScreen } from './create-patients-screen'

describe('createPatientsScreen', () => {
  it('loads patients through the use case', async () => {
    const screen = createPatientsScreen({
      listPatientsUseCase: {
        execute: vi.fn().mockResolvedValue([
          {
            id: 'patient_1',
            organizationId: 'org_1',
            fullName: 'Ana Torres',
            phone: '999888777',
            email: null,
            birthDate: null,
            documentId: null,
            administrativeNotes: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
        ]),
      },
      createPatientUseCase: {
        execute: vi.fn(),
      },
    })

    await screen.loadPatients()

    expect(screen.patients.value).toHaveLength(1)
    expect(screen.patients.value[0]?.fullName).toBe('Ana Torres')
  })

  it('submits a patient and reloads the list', async () => {
    const listPatientsUseCase = {
      execute: vi
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            id: 'patient_1',
            organizationId: 'org_1',
            fullName: 'Ana Torres',
            phone: '999888777',
            email: null,
            birthDate: null,
            documentId: null,
            administrativeNotes: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
        ]),
    }

    const createPatientUseCase = {
      execute: vi.fn().mockResolvedValue({
        id: 'patient_1',
        organizationId: 'org_1',
        fullName: 'Ana Torres',
        phone: '999888777',
        email: null,
        birthDate: null,
        documentId: null,
        administrativeNotes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }),
    }

    const screen = createPatientsScreen({
      listPatientsUseCase,
      createPatientUseCase,
    })

    await screen.loadPatients()
    screen.form.fullName = 'Ana Torres'
    screen.form.phone = '999888777'

    await screen.submitPatient()

    expect(createPatientUseCase.execute).toHaveBeenCalledWith({
      fullName: 'Ana Torres',
      phone: '999888777',
      email: null,
      birthDate: null,
      documentId: null,
      administrativeNotes: null,
    })
    expect(screen.successMessage.value).toBe('Paciente registrado correctamente.')
    expect(screen.patients.value).toHaveLength(1)
  })
})
