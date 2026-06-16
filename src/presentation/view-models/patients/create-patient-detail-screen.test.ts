import { describe, expect, it, vi } from 'vitest'
import { createPatientDetailScreen } from './create-patient-detail-screen'

const patientFixture = {
  id: 'patient_1',
  organizationId: 'org_1',
  fullName: 'Ana Torres',
  phone: '999888777',
  email: 'ana@example.test',
  birthDate: null,
  documentId: null,
  administrativeNotes: 'Nota inicial',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
}

describe('createPatientDetailScreen', () => {
  it('loads the patient detail into the form', async () => {
    const screen = createPatientDetailScreen({
      patientId: 'patient_1',
      getPatientDetailUseCase: {
        execute: vi.fn().mockResolvedValue(patientFixture),
      },
      updatePatientUseCase: {
        execute: vi.fn(),
      },
    })

    await screen.loadPatient()

    expect(screen.patient.value?.id).toBe('patient_1')
    expect(screen.form.fullName).toBe('Ana Torres')
    expect(screen.form.email).toBe('ana@example.test')
  })

  it('updates the patient and exposes a success message', async () => {
    const updatePatientUseCase = {
      execute: vi.fn().mockResolvedValue({
        ...patientFixture,
        fullName: 'Ana Torres Ruiz',
      }),
    }

    const screen = createPatientDetailScreen({
      patientId: 'patient_1',
      getPatientDetailUseCase: {
        execute: vi.fn().mockResolvedValue(patientFixture),
      },
      updatePatientUseCase,
    })

    await screen.loadPatient()
    screen.form.fullName = 'Ana Torres Ruiz'

    await screen.submitPatient()

    expect(updatePatientUseCase.execute).toHaveBeenCalledWith({
      patientId: 'patient_1',
      fullName: 'Ana Torres Ruiz',
      phone: '999888777',
      email: 'ana@example.test',
      birthDate: null,
      documentId: null,
      administrativeNotes: 'Nota inicial',
    })
    expect(screen.successMessage.value).toBe('Paciente actualizado correctamente.')
    expect(screen.patient.value?.fullName).toBe('Ana Torres Ruiz')
  })
})
