import { describe, expect, it, vi } from 'vitest'
import { createPatientDetailViewModel } from './patient-detail-view-model'

const patientFixture = {
  id: 'patient_1',
  organizationId: 'org_1',
  fullName: 'Ana Torres',
  phone: '999888777',
  email: 'ana@example.test',
  birthDate: null,
  documentId: null,
  administrativeNotes: 'Nota inicial',
  isUrgent: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
}

describe('createPatientDetailViewModel', () => {
  it('loads the patient detail into the form', async () => {
    const screen = createPatientDetailViewModel({
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
        isUrgent: true,
      }),
    }

    const screen = createPatientDetailViewModel({
      patientId: 'patient_1',
      getPatientDetailUseCase: {
        execute: vi.fn().mockResolvedValue(patientFixture),
      },
      updatePatientUseCase,
    })

    await screen.loadPatient()
    screen.startEditing()
    screen.form.fullName = 'Ana Torres Ruiz'
    screen.form.isUrgent = true

    screen.requestSave()
    expect(screen.isConfirmOpen.value).toBe(true)

    await screen.confirmSave()

    expect(updatePatientUseCase.execute).toHaveBeenCalledWith({
      patientId: 'patient_1',
      fullName: 'Ana Torres Ruiz',
      phone: '999888777',
      email: 'ana@example.test',
      birthDate: null,
      documentId: null,
      administrativeNotes: 'Nota inicial',
      isUrgent: true,
    })
    expect(screen.successMessage.value).toBe('Paciente actualizado correctamente.')
    expect(screen.patient.value?.fullName).toBe('Ana Torres Ruiz')
    expect(screen.patient.value?.isUrgent).toBe(true)
    expect(screen.isConfirmOpen.value).toBe(false)
    expect(screen.isEditing.value).toBe(false)
  })

  it('reverts unsaved changes when editing is cancelled', async () => {
    const screen = createPatientDetailViewModel({
      patientId: 'patient_1',
      getPatientDetailUseCase: {
        execute: vi.fn().mockResolvedValue(patientFixture),
      },
      updatePatientUseCase: {
        execute: vi.fn(),
      },
    })

    await screen.loadPatient()
    screen.startEditing()
    screen.form.fullName = 'Cambio sin guardar'

    screen.cancelEditing()

    expect(screen.form.fullName).toBe('Ana Torres')
    expect(screen.isEditing.value).toBe(false)
  })
})
