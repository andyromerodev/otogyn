import { describe, expect, it, vi } from 'vitest'
import { createPatientCreateScreen } from './create-patient-create-screen'

describe('createPatientCreateScreen', () => {
  it('submits a patient and exposes a success message', async () => {
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
        isUrgent: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }),
    }

    const screen = createPatientCreateScreen({
      createPatientUseCase,
    })

    screen.form.fullName = 'Ana Torres'
    screen.form.phone = '999888777'
    screen.form.isUrgent = true

    await screen.submitPatient()

    expect(createPatientUseCase.execute).toHaveBeenCalledWith({
      fullName: 'Ana Torres',
      phone: '999888777',
      email: null,
      birthDate: null,
      documentId: null,
      administrativeNotes: null,
      isUrgent: true,
    })
    expect(screen.successMessage.value).toBe('Paciente registrado correctamente.')
    expect(screen.createdPatient.value?.id).toBe('patient_1')
  })
})
