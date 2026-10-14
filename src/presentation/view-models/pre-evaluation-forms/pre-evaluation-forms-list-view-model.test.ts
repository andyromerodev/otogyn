import { describe, expect, it, vi } from 'vitest'
import { createPreEvaluationFormsListViewModel } from './pre-evaluation-forms-list-view-model'
import type { PreEvaluationForm } from '../../../domain/entities/pre-evaluation-form'

function makeForm(overrides: Partial<PreEvaluationForm> = {}): PreEvaluationForm {
  const now = new Date()
  return {
    id: 'form_1',
    organizationId: 'org_1',
    patientId: null,
    fullName: 'Andy Luis Hernández Romero',
    birthDate: null,
    residenceCityCountry: 'Lima, Perú',
    phone: '987654321',
    email: 'andy@example.com',
    complaintDescription: 'Molestias nasales',
    symptomDurationText: '1 mes',
    medicalHistory: null,
    previousTreatmentsAndExams: null,
    attachmentKeys: [],
    understandsVirtualConditions: true,
    consentPrivacyPolicy: true,
    age: null,
    city: null,
    mainReasons: [],
    mainReasonOtherText: null,
    symptomDuration: null,
    symptomPattern: null,
    associatedSymptoms: [],
    aggravatingFactors: [],
    hasPriorRefluxDiagnosis: null,
    hasPriorTreatment: null,
    priorMedicationUsed: null,
    treatmentImprovement: null,
    priorExams: [],
    alertSigns: [],
    consultationExpectations: [],
    consentInfoTruthful: true,
    consentUnderstandsNotConsultation: true,
    status: 'pending_review',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

describe('createPreEvaluationFormsListViewModel', () => {
  it('loads forms successfully', async () => {
    const listUseCase = {
      execute: vi.fn().mockResolvedValue({
        items: [makeForm()],
        total: 1,
        allTotal: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      }),
    }

    const viewModel = createPreEvaluationFormsListViewModel({
      listPreEvaluationFormsUseCase: listUseCase,
    })

    await viewModel.loadForms()

    expect(viewModel.forms.value).toHaveLength(1)
    expect(viewModel.forms.value[0]?.fullName).toBe('Andy Luis Hernández Romero')
    expect(viewModel.loading.value).toBe(false)
    expect(viewModel.errorMessage.value).toBeNull()
  })

  it('handles delete flow: opens confirm dialog, confirms deletion, and reloads list', async () => {
    const testForm = makeForm({ id: 'form_to_delete', fullName: 'Paciente Prueba' })
    const listUseCase = {
      execute: vi.fn().mockResolvedValue({
        items: [],
        total: 0,
        allTotal: 0,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      }),
    }
    const deleteUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    }

    const viewModel = createPreEvaluationFormsListViewModel({
      listPreEvaluationFormsUseCase: listUseCase,
      deletePreEvaluationFormUseCase: deleteUseCase,
    })

    // Open confirmation
    viewModel.openDeleteConfirm(testForm)
    expect(viewModel.isConfirmDeleteOpen.value).toBe(true)
    expect(viewModel.formToDelete.value?.id).toBe('form_to_delete')

    // Confirm deletion
    await viewModel.confirmDelete()

    expect(deleteUseCase.execute).toHaveBeenCalledWith('form_to_delete')
    expect(viewModel.isConfirmDeleteOpen.value).toBe(false)
    expect(viewModel.formToDelete.value).toBeNull()
    expect(viewModel.successMessage.value).toContain('Paciente Prueba')
    expect(listUseCase.execute).toHaveBeenCalled()
  })

  it('cancels delete dialog without executing deletion', async () => {
    const testForm = makeForm()
    const deleteUseCase = {
      execute: vi.fn(),
    }

    const viewModel = createPreEvaluationFormsListViewModel({
      listPreEvaluationFormsUseCase: { execute: vi.fn() },
      deletePreEvaluationFormUseCase: deleteUseCase,
    })

    viewModel.openDeleteConfirm(testForm)
    expect(viewModel.isConfirmDeleteOpen.value).toBe(true)

    viewModel.closeDeleteConfirm()
    expect(viewModel.isConfirmDeleteOpen.value).toBe(false)
    expect(viewModel.formToDelete.value).toBeNull()
    expect(deleteUseCase.execute).not.toHaveBeenCalled()
  })

  it('sets error message when deletion fails', async () => {
    const testForm = makeForm()
    const deleteUseCase = {
      execute: vi.fn().mockRejectedValue(new Error('Network error')),
    }

    const viewModel = createPreEvaluationFormsListViewModel({
      listPreEvaluationFormsUseCase: { execute: vi.fn() },
      deletePreEvaluationFormUseCase: deleteUseCase,
    })

    viewModel.openDeleteConfirm(testForm)
    await viewModel.confirmDelete()

    expect(viewModel.errorMessage.value).toBe('No se pudo eliminar el formulario de pre-evaluación.')
    expect(viewModel.isDeleting.value).toBe(false)
  })
})
